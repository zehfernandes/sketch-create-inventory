import Sketch from "sketch";
import nest from "./utils.js";
import _ from "lodash";

const CONFIGS = {
  arboardMargins: [500, 500],
  breakpoints: [
    {
      name: "Desktop",
      size: 1440
    },
    {
      name: "Mobile",
      size: 375
    }
  ],
  areaMargins: [100, 100],
  commentArea: 510,
  itemMargin: [20, 50],
  stateMargin: [20, 20]
};

const document = Sketch.fromNative(context.document);
const page = document.selectedPage;
const sketchData = document.sketchObject.documentData();

function getLibrary(lib) {
  const libraries = Sketch.getLibraries();
  const library = libraries[lib];

  const librarySymbols = library
    .getDocument()
    .sketchObject.documentData()
    .localSymbols();

  return [library, librarySymbols];
}

function parseName(name) {
  //let parsed = name.match(/(?![\w]\))[A-Za-z]+/g);
  let parsed = name
    .replace("Mobile", "") //Gamb
    .replace(/ +?/g, "")
    .split("/");

  return {
    artboardName: parsed[0],
    sectionName: parsed[1],
    state: parsed.slice(2, parsed.length).join("")
  };
}

function parseTree(symbolsTree) {
  const tree = [];

  symbolsTree.forEach((arr, index) => {
    arr.forEach(elm => {
      let props = parseName(elm.name());
      tree.push({
        symbol: elm,
        breakpoint: index,
        ...props
      });
    });
  });

  return nest(tree, ["artboardName", "sectionName", "state"]);
}

export default function() {
  // const arboardSize = [3600, 5000];
  // const HeaderSymbol = findSymbolByName("Header");
  // const BreakpointSymbol = findSymbolByName("Header");

  // TODO: Recieve library from UI
  const [desktopLibrary, desktopSymbols] = getLibrary(1);
  const [mobileLibrary, mobileSymbols] = getLibrary(2);

  const drawTree = parseTree([desktopSymbols, mobileSymbols]);
  console.log(drawTree);

  let tickY = 300;
  let countLoop = 0;

  //Artboard
  for (var artboard in drawTree) {
    const parent = drawArtboard(countLoop, artboard);
    //Section
    for (var section in drawTree[artboard]) {
      drawBreakpoitSection(section, parent, tickY);
      tickY = tickY + 90 + 100;
      //Row
      for (var row in drawTree[artboard][section]) {
        //Symbol
        let bigHeight = 0;
        for (var item in drawTree[artboard][section][row]) {
          let element = drawTree[artboard][section][row][item];

          let symbolMaster = importForeignSymbol(
            element.symbol,
            //TODO: One library?
            element.breakpoint == 0
              ? desktopLibrary.sketchObject
              : mobileLibrary.sketchObject
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

function drawBreakpoitSection(name, artboard, y) {
  const section = findSymbolByName("Breakpoint").createNewInstance();
  section.parent = artboard;
  section.frame.x = 100;
  section.frame.y = y;
  section.setOverrideValue(section.overrides[3], name);
}

function drawArtboard(i, name) {
  let artboard = new Sketch.Artboard({
    name: "",
    parent: page,
    background: {
      enabled: true,
      color: "#000000"
    },
    frame: {
      x: 3700 * i,
      y: 0,
      width: 3600,
      height: 3000
    }
  });

  const header = findSymbolByName("Header").createNewInstance();
  header.parent = artboard;
  header.frame.x = 100;
  header.frame.y = 100;
  header.setOverrideValue(header.overrides[1], name);

  return artboard;
}

function findSymbolByName(name) {
  const symbols = document.getSymbols();
  return symbols.find(symb => {
    return symb.name == name;
  });
}

function importForeignSymbol(symbol, library) {
  var objectReference = MSShareableObjectReference.referenceForShareableObject_inLibrary(
    symbol,
    library
  );

  const symbolMaster = AppController.sharedInstance()
    .librariesController()
    .importShareableObjectReference_intoDocument(objectReference, sketchData)
    .symbolMaster();

  return Sketch.fromNative(symbolMaster);
}
