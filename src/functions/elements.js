import Sketch from "sketch";
import { getSymbolsPage } from "./utils.js";
import {
  getBreakpointsData,
  getXGrid,
  getArtboardSize,
  getMargin
} from "./data.js";

const document = Sketch.fromNative(context.document);
const page = document.selectedPage;

// --------------
// Artboard
// --------------
export function drawArtboard(i, name) {
  let artboardWidth = getArtboardSize();

  let artboard = new Sketch.Artboard({
    name: name,
    parent: page,
    background: {
      enabled: true,
      color: "#000000"
    },
    frame: {
      x: (artboardWidth + 300) * i,
      y: 0,
      width: artboardWidth,
      height: 3000
    }
  });

  return artboard;
}

// --------------
// Header
// --------------
export function createHeaderSymbol() {
  let margin = getMargin();
  let xPosArr = getXGrid();

  let headerArboard = new Sketch.SymbolMaster({
    name: "Header",
    parent: getSymbolsPage(),
    background: {
      enabled: true,
      color: "#000000"
    },
    frame: {
      //x: 6000,
      //y: 6000,
      width: getArtboardSize(),
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
      x: xPosArr[0],
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
      x: margin,
      y: 20
    }
  });

  return headerArboard;
}

// --------------
// Breakpoint
// --------------
export function createBreakpointSymbol() {
  let margin = getMargin();
  const breakpoints = getBreakpointsData();
  const xPosArr = getXGrid();

  let breakpointArtboard = new Sketch.SymbolMaster({
    name: "Breakpoint",
    parent: getSymbolsPage(),
    background: {
      enabled: true,
      color: "#000000"
    },
    frame: {
      x: 2000,
      y: 2000,
      width: getArtboardSize(),
      height: 90
    }
  });

  let sectionTitle = new Sketch.Text({
    text: "1) Title",
    style: {
      fontFamily: "Helvetica",
      fontSize: 32,
      kerning: -1.5,
      fontWeight: 2,
      textColor: "#fff"
    },
    parent: breakpointArtboard,
    frame: {
      x: margin,
      y: 50
    }
  });

  let rectLine = new Sketch.Shape({
    name: "new way",
    parent: breakpointArtboard,
    frame: new Sketch.Rectangle(margin, 0, 512, 3),
    style: {
      fills: ["#fff"]
    }
  });

  breakpoints.forEach((bbk, index) => {
    let bbkPoint = new Sketch.Text({
      text: bbk.name,
      style: {
        fontFamily: "Helvetica",
        fontSize: 32,
        kerning: -1.5,
        fontWeight: 2,
        textColor: "#fff"
      },
      parent: breakpointArtboard,
      frame: {
        x: xPosArr[index],
        y: 50
      }
    });

    let rectLine = new Sketch.Shape({
      name: "new way",
      parent: breakpointArtboard,
      frame: new Sketch.Rectangle(xPosArr[index], 0, bbk.size, 3),
      style: {
        fills: ["#fff"]
      }
    });
  });

  return breakpointArtboard;
}
