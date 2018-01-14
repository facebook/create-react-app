/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const browserslist = require('browserslist');
const chalk = require('chalk');
const os = require('os');

function checkBrowsers(dir) {
  const found = browserslist.findConfig(dir);

  if (found == null) {
    console.log(
      chalk.red('As of react-scripts >=2 you must specify targeted browsers.') +
        os.EOL +
        `Please add a ${chalk.underline(
          'browserslist'
        )} key to your ${chalk.bold('package.json')}.`
    );
    return null;
  }
  return found;
}

function printBrowsers(dir) {
  let browsers = checkBrowsers(dir);
  if (browsers == null) {
    console.log('Built the bundle with default browser support.');
    return;
  }
  browsers = browsers[process.env.NODE_ENV] || browsers;
  if (Array.isArray(browsers)) {
    browsers = browsers.join(', ');
  }
  console.log(
    `Built the bundle with browser support for ${chalk.cyan(browsers)}.`
  );
}

module.exports = { checkBrowsers, printBrowsers };
