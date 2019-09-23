import Sketch from "sketch";
import _ from "lodash";

const document = Sketch.fromNative(context.document);
const sketchData = document.sketchObject.documentData();

export function nest(seq, keys) {
  if (!keys.length) return seq;
  var first = keys[0];
  var rest = keys.slice(1);
  return _.mapValues(_.groupBy(seq, first), function(value) {
    return nest(value, rest);
  });
}

export function getSymbolsPage() {
  const document = Sketch.fromNative(context.document);

  let symbolPage = Sketch.Page.getSymbolsPage(document);
  if (symbolPage == undefined) {
    symbolPage = Sketch.Page.createSymbolsPage();
    symbolPage.parent = document;
  }

  return symbolPage;
}

export function findSymbolByName(name) {
  const symbols = document.getSymbols();
  return symbols.find(symb => {
    return symb.name == name;
  });
}

export function importForeignSymbol(symbol, library) {
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

export function getLibrary(libName) {
  const libraries = Sketch.getLibraries();
  const library = libraries.find(obj => {
    return libName === obj.name;
  });

  const librarySymbols = library
    .getDocument()
    .sketchObject.documentData()
    .localSymbols();

  return [library, librarySymbols];
}
