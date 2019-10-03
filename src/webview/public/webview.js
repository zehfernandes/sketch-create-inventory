
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.bbk = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.lib = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.l = list[i];
    	child_ctx.each_value_1 = list;
    	child_ctx.l_index = i;
    	return child_ctx;
    }

    // (43:8) {#each libOptions as lib}
    function create_each_block_2(ctx) {
    	var option, t_value = ctx.lib + "", t, option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.lib;
    			option.value = option.__value;
    			add_location(option, file, 43, 8, 1069);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.libOptions) && t_value !== (t_value = ctx.lib + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.libOptions) && option_value_value !== (option_value_value = ctx.lib)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(43:8) {#each libOptions as lib}", ctx });
    	return block;
    }

    // (35:4) {#each librarys as l}
    function create_each_block_1(ctx) {
    	var div, select, dispose;

    	let each_value_2 = ctx.libOptions;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	function select_change_handler() {
    		ctx.select_change_handler.call(select, ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			if (ctx.l === void 0) add_render_callback(select_change_handler);
    			attr_dev(select, "id", "libSelect");
    			set_style(select, "height", "30px");
    			attr_dev(select, "class", "ba b--black-20 pa2 db w-100 br0");
    			add_location(select, file, 36, 6, 886);
    			attr_dev(div, "id", "libFile");
    			attr_dev(div, "class", "measure mb3");
    			add_location(div, file, 35, 4, 841);
    			dispose = listen_dev(select, "change", select_change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.l);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.libOptions) {
    				each_value_2 = ctx.libOptions;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_2.length;
    			}

    			if (changed.librarys) select_option(select, ctx.l);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(35:4) {#each librarys as l}", ctx });
    	return block;
    }

    // (61:4) {#each breakpoints as bbk}
    function create_each_block(ctx) {
    	var div2, div0, label0, t1, input0, t2, div1, label1, t4, input1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Name";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Size";
    			t4 = space();
    			input1 = element("input");
    			attr_dev(label0, "for", "bp-name");
    			attr_dev(label0, "class", "f7 db mb2");
    			add_location(label0, file, 63, 8, 1501);
    			attr_dev(input0, "id", "bp-name");
    			attr_dev(input0, "class", "breakpointNameField br2 libField input-reset ba b--black-20 pa1 db w-100");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file, 64, 8, 1561);
    			attr_dev(div0, "class", "fl w-70 pr2");
    			add_location(div0, file, 62, 6, 1467);
    			attr_dev(label1, "for", "bp-size");
    			attr_dev(label1, "class", "f7 db mb2");
    			add_location(label1, file, 72, 8, 1765);
    			attr_dev(input1, "id", "bp-size");
    			attr_dev(input1, "class", "breakpointSizeField br2 input-reset ba b--black-20 pa1 db w-100");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file, 73, 8, 1825);
    			attr_dev(div1, "class", "fl w-30");
    			add_location(div1, file, 71, 6, 1735);
    			attr_dev(div2, "id", "breakpoint");
    			attr_dev(div2, "class", "measure mb3 cf");
    			add_location(div2, file, 61, 4, 1416);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(61:4) {#each breakpoints as bbk}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var body, div0, h40, t1, t2, a0, t4, div1, h41, t6, t7, a1, t9, div2, a2, dispose;

    	let each_value_1 = ctx.librarys;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = ctx.breakpoints;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			body = element("body");
    			div0 = element("div");
    			h40 = element("h4");
    			h40.textContent = "Library";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			a0 = element("a");
    			a0.textContent = "+ Add library";
    			t4 = space();
    			div1 = element("div");
    			h41 = element("h4");
    			h41.textContent = "Breakpoints";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			a1 = element("a");
    			a1.textContent = "+ Add breakpoint";
    			t9 = space();
    			div2 = element("div");
    			a2 = element("a");
    			a2.textContent = "Create Inventory";
    			attr_dev(h40, "class", "f5 b mb3");
    			add_location(h40, file, 32, 4, 776);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "class", "f6 link blue hover-dark-gray");
    			add_location(a0, file, 49, 4, 1166);
    			attr_dev(div0, "class", "w-100 pt2 mb4");
    			add_location(div0, file, 31, 2, 744);
    			attr_dev(h41, "class", "f5 b mb3");
    			add_location(h41, file, 58, 4, 1342);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "class", "f6 link blue hover-dark-gray db");
    			add_location(a1, file, 81, 4, 2010);
    			attr_dev(div1, "class", "w-100 pb2");
    			add_location(div1, file, 57, 2, 1314);
    			attr_dev(a2, "id", "run");
    			attr_dev(a2, "class", " br2 f6 link dim br1 mb2 dib white bg-blue");
    			set_style(a2, "padding", "12px 30px");
    			attr_dev(a2, "href", "#0");
    			add_location(a2, file, 90, 4, 2198);
    			attr_dev(div2, "class", "w-100 tr pt2");
    			add_location(div2, file, 89, 2, 2167);
    			attr_dev(body, "class", "helvetica pa3 navy bg-light-gray");
    			add_location(body, file, 30, 0, 694);

    			dispose = [
    				listen_dev(a0, "click", prevent_default(ctx.addLibrary), false, true),
    				listen_dev(a1, "click", prevent_default(ctx.addBreakpoint), false, true),
    				listen_dev(a2, "click", prevent_default(ctx.submit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div0);
    			append_dev(div0, h40);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div0, t2);
    			append_dev(div0, a0);
    			append_dev(body, t4);
    			append_dev(body, div1);
    			append_dev(div1, h41);
    			append_dev(div1, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t7);
    			append_dev(div1, a1);
    			append_dev(body, t9);
    			append_dev(body, div2);
    			append_dev(div2, a2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.librarys || changed.libOptions) {
    				each_value_1 = ctx.librarys;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, t2);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.breakpoints) {
    				const old_length = each_value.length;
    				each_value = ctx.breakpoints;

    				let i;
    				for (i = old_length; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (!each_blocks[i]) {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t7);
    					}
    				}

    				for (i = each_value.length; i < old_length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(body);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let librarys = [""];
      let breakpoints = [{ name: "", size: "" }];
      let libOptions = [""];

      onMount(async () => {
        window.postMessage("getConfig");
      });

      function addLibrary() {
        $$invalidate('librarys', librarys = librarys.concat("name"));
      }

      function addBreakpoint() {
        $$invalidate('breakpoints', breakpoints = breakpoints.concat({ name: "", size: "" }));
      }

      function submit() {
        window.postMessage("savePreferences", { librarys, breakpoints });
      }

      window.loadConfigs = configs => {
        const { sketchLibs, sketchBreakpoints, sketchLibraries } = configs;
        $$invalidate('librarys', librarys = sketchLibraries);
        $$invalidate('breakpoints', breakpoints = sketchBreakpoints);
        $$invalidate('libOptions', libOptions = sketchLibs);
      };

    	function select_change_handler({ l, each_value_1, l_index }) {
    		each_value_1[l_index] = select_value(this);
    		$$invalidate('librarys', librarys);
    		$$invalidate('libOptions', libOptions);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('librarys' in $$props) $$invalidate('librarys', librarys = $$props.librarys);
    		if ('breakpoints' in $$props) $$invalidate('breakpoints', breakpoints = $$props.breakpoints);
    		if ('libOptions' in $$props) $$invalidate('libOptions', libOptions = $$props.libOptions);
    	};

    	return {
    		librarys,
    		breakpoints,
    		libOptions,
    		addLibrary,
    		addBreakpoint,
    		submit,
    		select_change_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=webview.js.map
