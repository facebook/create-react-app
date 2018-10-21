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
const os = require('os');

function writeJson(fileName, object) {
  fs.writeFileSync(fileName, JSON.stringify(object, null, 2) + os.EOL);
}

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

  const messages = [];
  let tsconfig;
  try {
    tsconfig = require(paths.appTsConfig);
  } catch (_) {
    console.error(
      chalk.red.bold(
        'Could not parse',
        chalk.cyan('tsconfig.json') + '.',
        'Please make sure it contains syntactically correct JSON.'
      )
    );
    process.exit(1);
  }

  if (tsconfig.compilerOptions == null) {
    tsconfig.compilerOptions = {};
  }

  if (tsconfig.compilerOptions.isolatedModules !== true) {
    tsconfig.compilerOptions.isolatedModules = true;
    messages.push(
      `${chalk.cyan(
        'compilerOptions.isolatedModules'
      )} must be ${chalk.cyan.bold('true')}`
    );
  }
  if (tsconfig.compilerOptions.noEmit !== true) {
    tsconfig.compilerOptions.noEmit = true;
    messages.push(
      `${chalk.cyan('compilerOptions.noEmit')} must be ${chalk.cyan.bold(
        'true'
      )}`
    );
  }
  if (tsconfig.compilerOptions.jsx !== 'preserve') {
    tsconfig.compilerOptions.jsx = 'preserve';
    messages.push(
      `${chalk.cyan('compilerOptions.jsx')} must be ${chalk.cyan.bold(
        'preserve'
      )}`
    );
  }
  if (tsconfig.include == null) {
    tsconfig.include = ['src'];
    messages.push(
      `${chalk.cyan('include')} should be ${chalk.cyan.bold('src')}`
    );
  }
  if (tsconfig.exclude == null) {
    tsconfig.exclude = ['**/__tests__/**', '**/?*(spec|test).*'];
    messages.push(`${chalk.cyan('exclude')} should exclude test files`);
  }

  if (messages.length > 0) {
    console.warn(
      chalk.bold(
        'The following changes are being made to your',
        chalk.cyan('tsconfig.json'),
        'file:'
      )
    );
    messages.forEach(message => {
      console.warn('  - ' + message);
    });
    console.warn();
    writeJson(paths.appTsConfig, tsconfig);
  }
}

module.exports = verifyTypeScriptSetup;
