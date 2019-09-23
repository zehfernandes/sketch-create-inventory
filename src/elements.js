import Sketch from "sketch";
import { getSymbolsPage } from "./utils.js";

const document = Sketch.fromNative(context.document);
const page = document.selectedPage;

// --------------
// Artboard
// --------------
export function drawArtboard(i, name) {
  let artboard = new Sketch.Artboard({
    name: name,
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

  return artboard;
}

// --------------
// Header
// --------------
export function createHeaderSymbol() {
  let headerArboard = new Sketch.SymbolMaster({
    name: "Header",
    parent: getSymbolsPage(),
    background: {
      enabled: true,
      color: "#000000"
    },
    frame: {
      x: 6000,
      y: 6000,
      width: 2000,
      height: 60
    }
  });

  let title = new Sketch.Text({
    text: "1) Title",
    style: {
      fontFamily: "Helvetica",
      fontSize: 56,
      kerning: -2.6,
      fontWeight: 2,
      textColor: "#fff"
    },
    parent: headerArboard,
    frame: {
      x: 1230,
      y: 0
    }
  });

  let logoText = new Sketch.Text({
    text: "Inventary",
    style: {
      fontFamily: "Helvetica",
      fontSize: 20,
      textTransform: "uppercase",
      textColor: "#fff"
    },
    parent: headerArboard,
    frame: {
      x: 0,
      y: 20
    }
  });

  return headerArboard;
}
