// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs');
const resolve = require('resolve');
const paths = require('../../config/paths');

function verifyTypeScriptSetup() {
  if (!fs.existsSync(paths.appTsConfig)) {
    return;
  }

  const isYarn = fs.existsSync(paths.yarnLockFile);

  // Ensure typescript is installed
  try {
    resolve.sync('typescript', {
      basedir: paths.appNodeModules,
    });
  } catch (_) {
    console.error(
      chalk.red(
        'We detected a',
        chalk.bold('tsconfig.json'),
        "in your package root but couldn't find an installation of",
        chalk.bold('typescript') + '.'
      )
    );
    console.error();
    console.error(
      chalk.bold(
        'Please install',
        chalk.cyan.bold('typescript'),
        'by running',
        chalk.cyan.bold(
          isYarn ? 'yarn add typescript' : 'npm install typescript'
        ) + '.'
      )
    );
    console.error(
      'If you are not trying to use TypeScript, please remove the ' +
        chalk.cyan('tsconfig.json') +
        ' file from your package root.'
    );
    console.error();
    process.exit(1);
  }
}

module.exports = verifyTypeScriptSetup;
