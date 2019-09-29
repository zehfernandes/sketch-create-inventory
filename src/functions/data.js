const Settings = require("sketch/settings");

const margin = 100;
const sectionArea = 512;

export function createDefaultData() {
  let setting = Settings.settingForKey("inventory-breakpoints");
  if (setting) return;

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

  Settings.setSettingForKey("inventory-breakpoints", breakpoints);
}

export function getBreakpointsData() {
  return Settings.settingForKey("inventory-breakpoints");
}

export function getXGrid() {
  const breakpoints = getBreakpointsData();

  let bbkX = margin + sectionArea + margin;
  const xGrid = breakpoints.map(bbk => {
    let xPos = bbkX;
    bbkX = bbkX + bbk.size + margin;
    return xPos;
  });

  return xGrid;
}

export function getMargin() {
  return margin;
}

export function getArtboardSize() {
  const breakpoints = getBreakpointsData();

  let bbkSum = breakpoints.reduce((sum, bbk) => {
    return sum.size + bbk.size + margin;
  });

  return sectionArea + margin + bbkSum + margin * 2;
}
