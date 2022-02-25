'use strict';

const paths = require("../config/paths");
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const crossOriginLoading = bpkReactScriptsConfig.crossOriginLoading || false;
const sriEnabled = bpkReactScriptsConfig.sriEnabled || false;

module.exports = {
    crossOriginLoading: sriEnabled ? 'anonymous' : crossOriginLoading
}
