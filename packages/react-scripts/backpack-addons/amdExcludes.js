'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};

module.exports = {
  test: new RegExp(
    `(^|/)(${(bpkReactScriptsConfig.amdExcludes || [])
    .concat('lodash')
    .join('|')})(/|.|$)`
  ),
  parser: {
    amd: false,
  }
}; 