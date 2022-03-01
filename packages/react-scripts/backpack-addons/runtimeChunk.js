'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};

const runtimeChunk = {
  runtimeChunk: bpkReactScriptsConfig.enableAutomaticChunking
  ? {
    name: entrypoint => `runtime-${entrypoint.name}`,
  }
  : false
}

const ssrRuntimeChunk = { 
  runtimeChunk: false,
}

module.exports = {
  runtimeChunk,
  ssrRuntimeChunk
};