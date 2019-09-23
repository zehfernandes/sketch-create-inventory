import {
  nest,
  getLibrary,
  findSymbolByName,
  importForeignSymbol
} from "./utils.js";
import { drawArtboard, createHeaderSymbol } from "./elements.js";

function getBreakpointIndex(name) {
  let breakpointIndex = breakpoints.indexOf(
    breakpoints.find(l => name.includes(l.name))
  );

  return breakpointIndex != -1 ? breakpointIndex : 0;
}

function parseName(name) {
  let breakpoint = getBreakpointIndex(name);

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

function parseTree(symbolsTree, allLibraries) {
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

//----------------------------------------------
// Configs
// const CONFIGS = {
//   arboardMargins: [500, 500],
//   areaMargins: [100, 100],
//   commentArea: 510,
//   itemMargin: [20, 50],
//   stateMargin: [20, 20]
// };

let HeaderSymbol, BreakpointSymbol;

const libraryFiles = [
  "PX_Styleguide_Presale_20190828",
  "PX_MobileStyleguide_Presale_20190828"
];

const breakpoints = [
  {
    name: "Desktop",
    size: 1440
  },
  {
    name: "Mobile",
    size: 375
  }
];

// Start
export default function() {
  // Get sections Symbols
  HeaderSymbol = findSymbolByName("Header");
  if (!HeaderSymbol) {
    HeaderSymbol = createHeaderSymbol();
  }

  // TODO: Recieve library from UI
  const libraries = libraryFiles.map(name => {
    return getLibrary(name);
  });

  const allSymbols = libraries.map(l => l[1]);
  const allLibraries = libraries.map(l => l[0]);

  const drawTree = parseTree(allSymbols, allLibraries);
  console.log(drawTree);

  let tickY = 300;
  let countLoop = 0;

  //Artboard
  for (var artboard in drawTree) {
    const parent = drawArtboard(countLoop, artboard);
    drawHeader(artboard, parent);

    //Section
    for (var section in drawTree[artboard]) {
      drawBreakpointSection(section, parent, tickY);
      tickY = tickY + 90 + 100;
      //Row
      for (var row in drawTree[artboard][section]) {
        //Symbol
        let bigHeight = 0;
        for (var item in drawTree[artboard][section][row]) {
          let element = drawTree[artboard][section][row][item];

          let symbolMaster = importForeignSymbol(
            element.symbol,
            element.library.sketchObject
          );

          let symbolInstance = symbolMaster.createNewInstance();
          symbolInstance.parent = parent;

          //TODO: Get breakpoit position from config
          symbolInstance.frame.x = element.breakpoint == 0 ? 730 : 3071;
          symbolInstance.frame.y = tickY;

          bigHeight = Math.max(bigHeight, symbolInstance.frame.height);
        }

        tickY = tickY + bigHeight + 50;
      }
    }

    parent.frame.height = tickY + 100;

    tickY = 300;
    countLoop = countLoop + 1;
  }
}

function drawBreakpointSection(name, artboard, y) {
  const section = findSymbolByName("Breakpoint").createNewInstance();
  section.parent = artboard;
  section.frame.x = 100;
  section.frame.y = y;
  section.setOverrideValue(section.overrides[3], name);
}

function drawHeader(name, artboard) {
  const header = HeaderSymbol.createNewInstance();
  header.parent = artboard;
  header.frame.x = 100;
  header.frame.y = 100;
  header.setOverrideValue(header.overrides[1], name);
}
