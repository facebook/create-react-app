"use strict";

const postcssNormalize = require("postcss-normalize");
const paths = require("../config/paths");
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson["backpack-react-scripts"] || {};
const cssModulesEnabled = bpkReactScriptsConfig.cssModules !== false;

// Backpack / saddlebag node module regexes
const backpackModulesRegex = /node_modules[\\/]bpk-/;
const scopedBackpackModulesRegex = /node_modules[\\/]@skyscanner[\\/]bpk-/;
const backpackSinglePackageModulesRegex = /node_modules[\\/]@skyscanner[\\/]backpack-web/;

const getStyleTestRegexes = (regexType) => {
  // style files regexes, the regex values should keep up to date with webpack.config.js
  const cssRegex = /\.css$/;
  const cssModuleRegex = /\.module\.css$/;
  const sassRegex = /\.(scss|sass)$/;
  const sassModuleRegex = /\.module\.(scss|sass)$/;

  switch (regexType) {
    case "css":
      return {
        and: [cssRegex, () => !cssModulesEnabled],
        exclude: [
          backpackModulesRegex,
          backpackSinglePackageModulesRegex,
          scopedBackpackModulesRegex,
        ],
      };
    case "cssModule":
      return [
        cssModuleRegex,
        {
          and: [cssRegex, () => cssModulesEnabled],
        },
        {
          and: [
            cssRegex,
            backpackModulesRegex,
            backpackSinglePackageModulesRegex,
            scopedBackpackModulesRegex,
          ],
        },
      ];
    case "sass":
      return {
        and: [sassRegex, () => !cssModulesEnabled],
        exclude: [
          backpackModulesRegex,
          backpackSinglePackageModulesRegex,
          scopedBackpackModulesRegex,
        ],
      };
    case "sassModule":
      return [
        sassModuleRegex,
        {
          and: [sassRegex, () => cssModulesEnabled],
        },
        {
          and: [
            sassRegex,
            backpackModulesRegex,
            backpackSinglePackageModulesRegex,
            scopedBackpackModulesRegex,
          ],
        },
      ];
    default:
      throw new Error("Not implemented.");
  }
};

const getCSSModuleLocalIdent = () => {
    return (
        require('../utils/getCSSModuleLocalIdentWithProjectName')(
            appPackageJson.name
        )
    )
};

module.exports = {
  getStyleTestRegexes,
  getCSSModuleLocalIdent
};
