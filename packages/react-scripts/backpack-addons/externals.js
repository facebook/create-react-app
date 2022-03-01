'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};

function externals(isEnvProduction) {
  if (!isEnvProduction) {
    return {
      externals: {},
    }
  }
  return {
    externals: bpkReactScriptsConfig.externals || {},
  }
}

function ssrExternals() {
  return {
    externals: bpkReactScriptsConfig.ssrExternals || [],
  }
}

module.exports = {
  externals,
  ssrExternals
};