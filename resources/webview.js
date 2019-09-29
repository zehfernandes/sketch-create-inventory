//Get Libraries
const libraries = [];
const breakpoints = [];

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener("contextmenu", e => {
  e.preventDefault();
});

// call the plugin from the webview
document.getElementById("button").addEventListener("click", () => {
  const libsElm = document.querySelectorAll(".libField");
  const breakNameElm = document.querySelectorAll(".breakpointNameField");
  const breakSizeElm = document.querySelectorAll(".breakpointSizeField");

  document.forEach((el, i) => {
    libraries.push(el.value);
  });

  breakNameElm.forEach((el, i) => {
    breakpoints.push({
      name: el.value,
      size: breakSizeElm[i].value
    });
  });

  window.postMessage("savePreferences", { libraries, breakpoints });
});

// call the wevbiew from the plugin
window.loadConfigs = configs => {
  const { libraries, breakpoints } = configs;
  //document.getElementById("answer").innerHTML = "Random number from the plugin: " + randomNumber;
};
