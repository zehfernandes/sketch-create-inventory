import {
  getLibrary,
  findSymbolByName,
  importForeignSymbol
} from "./functions/utils.js";
import { parseTree } from "./functions/parser.js";
import {
  drawArtboard,
  createHeaderSymbol,
  createBreakpointSymbol
} from "./functions/elements.js";
import { getXGrid, getLibraryData } from "./functions/data.js";

let HeaderSymbol, BreakpointSymbol;

let libraryFiles = [];
//   "PX_Styleguide_Presale_20190828",
//   "PX_MobileStyleguide_Presale_20190828"

// Start
export default function createSymbolInventory() {
  libraryFiles = getLibraryData();

  // Get sections Symbols
  HeaderSymbol = findSymbolByName("Header");
  if (!HeaderSymbol) {
    HeaderSymbol = createHeaderSymbol();
  }

  BreakpointSymbol = findSymbolByName("Breakpoint");
  if (!BreakpointSymbol) {
    BreakpointSymbol = createBreakpointSymbol();
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
  let xGrid = getXGrid();

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
          symbolInstance.frame.x = xGrid[element.breakpoint];
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
  const section = BreakpointSymbol.createNewInstance();
  section.parent = artboard;
  section.frame.x = 0;
  section.frame.y = y;
  // TODO error handle
  section.setOverrideValue(section.overrides[2], name);
}

function drawHeader(name, artboard) {
  const header = HeaderSymbol.createNewInstance();
  header.parent = artboard;
  header.frame.x = 0;
  header.frame.y = 100;
  header.setOverrideValue(header.overrides[1], name);
}
