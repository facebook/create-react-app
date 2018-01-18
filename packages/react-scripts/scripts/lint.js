// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const CLIEngine = require('eslint').CLIEngine;

const cli = new CLIEngine({
  // @remove-on-eject-begin
  configFile: require.resolve('eslint-config-react-app'),
  // @remove-on-eject-end
  fix: process.argv.slice(2).indexOf('--fix') >= 0,
});
const report = cli.executeOnFiles(['src/**/*.{js,jsx,mjs}']);
const formatter = cli.getFormatter();

// persist changed files when using --fix option
CLIEngine.outputFixes(report);
console.log(formatter(report.results));

if (report.errorCount > 0) {
  process.exit(1);
}
