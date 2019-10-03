<script>
  import { onMount } from "svelte";

  let librarys = [""];
  let breakpoints = [{ name: "", size: "" }];
  let libOptions = [""];

  onMount(async () => {
    window.postMessage("getConfig");
  });

  function addLibrary() {
    librarys = librarys.concat("name");
  }

  function addBreakpoint() {
    breakpoints = breakpoints.concat({ name: "", size: "" });
  }

  function submit() {
    window.postMessage("savePreferences", { librarys, breakpoints });
  }

  window.loadConfigs = configs => {
    const { sketchLibs, sketchBreakpoints, sketchLibraries } = configs;
    librarys = sketchLibraries;
    breakpoints = sketchBreakpoints;
    libOptions = sketchLibs;
  };
</script>
<body class="helvetica pa3 navy bg-light-gray">
  <div class="w-100 pt2 mb4">
    <h4 class="f5 b mb3">Library</h4>

    {#each librarys as l}
    <div id="libFile" class="measure mb3">
      <select
        id="libSelect"
        style="height: 30px"
        class="ba b--black-20 pa2 db w-100 br0"
        bind:value="{l}"
      >
        {#each libOptions as lib}
        <option value="{lib}">{lib}</option>
        {/each}
      </select>
    </div>
    {/each}

    <a
      href="#"
      on:click|preventDefault="{addLibrary}"
      class="f6 link blue hover-dark-gray"
      >+ Add library</a
    >
  </div>

  <div class="w-100 pb2">
    <h4 class="f5 b mb3">Breakpoints</h4>

    {#each breakpoints as bbk}
    <div id="breakpoint" class="measure mb3 cf">
      <div class="fl w-70 pr2">
        <label for="bp-name" class="f7 db mb2">Name</label>
        <input
          id="bp-name"
          class="breakpointNameField br2 libField input-reset ba b--black-20 pa1 db w-100"
          type="text"
          bind:value="{bbk.name}"
        />
      </div>

      <div class="fl w-30">
        <label for="bp-size" class="f7 db mb2">Size</label>
        <input
          id="bp-size"
          class="breakpointSizeField br2 input-reset ba b--black-20 pa1 db w-100"
          type="text"
          bind:value="{bbk.size}"
        />
      </div>
    </div>
    {/each}
    <a
      href="#"
      on:click|preventDefault="{addBreakpoint}"
      class="f6 link blue hover-dark-gray db"
      >+ Add breakpoint</a
    >
  </div>

  <div class="w-100 tr pt2">
    <a
      on:click|preventDefault="{submit}"
      id="run"
      class=" br2 f6 link dim br1 mb2 dib white bg-blue"
      style="padding: 12px 30px"
      href="#0"
      >Create Inventory</a
    >
  </div>
</body>
