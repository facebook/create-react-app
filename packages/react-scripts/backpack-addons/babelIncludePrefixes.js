"use strict";

const paths = require("../config/paths");
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson["backpack-react-scripts"] || {};
const customModuleRegexes = bpkReactScriptsConfig.babelIncludePrefixes
  ? bpkReactScriptsConfig.babelIncludePrefixes.map(
      (prefix) => new RegExp(`node_modules[\\/]${prefix}`)
    )
  : [];

// Backpack / saddlebag node module regexes
const backpackModulesRegex = /node_modules[\\/]bpk-/;
const saddlebagModulesRegex = /node_modules[\\/]saddlebag-/;
const scopedBackpackModulesRegex = /node_modules[\\/]@skyscanner[\\/]bpk-/;

module.exports = () => {
  return [
    paths.appSrc,
    backpackModulesRegex,
    saddlebagModulesRegex,
    scopedBackpackModulesRegex,
    ...customModuleRegexes,
  ];
};
