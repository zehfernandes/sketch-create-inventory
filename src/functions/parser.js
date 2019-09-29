import { nest } from "./utils.js";
import { getBreakpointsData } from "./data.js";

function getBreakpointIndex(name, breakpoints) {
  let breakpointIndex = breakpoints.indexOf(
    breakpoints.find(l => name.includes(l.name))
  );

  return breakpointIndex != -1 ? breakpointIndex : 0;
}

function parseName(name) {
  const breakpoints = getBreakpointsData();

  let breakpoint = getBreakpointIndex(name, breakpoints);

  let parsed = "";
  breakpoints.forEach(b => {
    parsed = name.replace(b.name, "");
  });

  parsed = parsed.replace(/ +?/g, "").split("/");

  return {
    artboardName: parsed[0],
    sectionName: parsed[1],
    breakpoint,
    state: parsed.slice(2, parsed.length).join("")
  };
}

export function parseTree(symbolsTree, allLibraries) {
  const tree = [];

  symbolsTree.forEach((arr, index) => {
    arr.forEach(elm => {
      let props = parseName(elm.name());
      tree.push({
        library: allLibraries[index],
        symbol: elm,
        ...props
      });
    });
  });

  return nest(tree, ["artboardName", "sectionName", "state"]);
}
