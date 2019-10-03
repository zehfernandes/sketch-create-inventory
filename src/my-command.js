import BrowserWindow from "sketch-module-web-view";
import { getWebview } from "sketch-module-web-view/remote";
import Sketch from "sketch";
import {
  createDefaultData,
  saveLibraryData,
  saveBreakpointsData,
  getLibraryData
} from "./functions/data.js";
import createSymbolInventory from "./generator.js";

const webviewIdentifier = "create-inventory.webview";

export default function() {
  const options = {
    identifier: webviewIdentifier,
    width: 340,
    height: 350,
    show: false
  };

  const browserWindow = new BrowserWindow(options);

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once("ready-to-show", () => {
    browserWindow.show();
  });

  const webContents = browserWindow.webContents;

  // print a message when the page loads
  webContents.on("did-finish-load", () => {
    Sketch.UI.message("UI loaded!");
  });

  webContents.on("getConfig", () => {
    const breakpoints = createDefaultData();

    const libOptions = Sketch.getLibraries();

    const configs = {
      sketchLibraries: [""], //getLibraryData(),
      sketchLibs: libOptions.map(l => l.name),
      sketchBreakpoints: breakpoints
    };

    console.log(configs);

    webContents
      .executeJavaScript(`loadConfigs(${JSON.stringify(configs)})`)
      .catch(console.error);
  });

  // add a handler for a call from web content's javascript
  webContents.on("savePreferences", configs => {
    console.log(configs);
    saveLibraryData(configs.librarys);
    saveBreakpointsData(configs.breakpoints);
    browserWindow.close();
    createSymbolInventory();
  });

  browserWindow.loadURL(require("../resources/webview.html"));
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier);
  if (existingWebview) {
    existingWebview.close();
  }
}
