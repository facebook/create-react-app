'use strict';

const paths = require('../config/paths');
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
const ignoreCssWarnings = bpkReactScriptsConfig.ignoreCssWarnings || false;

module.exports = {
    ignoreOrder: ignoreCssWarnings
}
