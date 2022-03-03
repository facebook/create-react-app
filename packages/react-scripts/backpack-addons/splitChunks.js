'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};

module.exports = (isEnvDevelopment) => {
  // Automatically split vendor and commons
  // https://twitter.com/wSokra/status/969633336732905474
  // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
  return {
    splitChunks: bpkReactScriptsConfig.enableAutomaticChunking
    ? {
      chunks: 'all',
      name: isEnvDevelopment,
      cacheGroups: bpkReactScriptsConfig.vendorsChunkRegex
        ? {
            vendors: {
              test: new RegExp(bpkReactScriptsConfig.vendorsChunkRegex)
            },
          }
        : {},
      }
    : {}
  }
};