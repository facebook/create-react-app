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
const path = require('path');
const paths = require('../../config/paths');
const os = require('os');

function writeJson(fileName, object) {
  fs.writeFileSync(fileName, JSON.stringify(object, null, 2) + os.EOL);
}

const compilerOptions = {
  // These are suggested values and will be set when not present in the
  // tsconfig.json
  target: { suggested: 'es5' },
  allowJs: { suggested: true },
  skipLibCheck: { suggested: true },
  esModuleInterop: { suggested: true },
  allowSyntheticDefaultImports: { suggested: true },
  strict: { suggested: true },

  // This values are required and cannot be changed by the user
  module: { value: 'esnext', reason: 'for import() and import/export' },
  moduleResolution: { value: 'node', reason: 'to match webpack resolution' },
  isolatedModules: { value: true, reason: 'implementation limitation' },
  noEmit: { value: true },
  jsx: { value: 'preserve', reason: 'JSX is compiled by Babel' },
};

function verifyTypeScriptSetup() {
  if (!fs.existsSync(paths.appTsConfig)) {
    if (!paths.appIndexJs.match(/\.ts?$/)) {
      return;
    }
    writeJson(paths.appTsConfig, {});
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

  for (const option of Object.keys(compilerOptions)) {
    const { value, suggested, reason } = compilerOptions[option];
    if (suggested != null) {
      if (tsconfig.compilerOptions[option] === undefined) {
        tsconfig.compilerOptions[option] = suggested;
        messages.push(
          `${chalk.cyan('compilerOptions.' + option)} to be ${chalk.bold(
            'suggested'
          )} value: ${chalk.cyan.bold(suggested)} (this can be changed)`
        );
      }
    } else if (tsconfig.compilerOptions[option] !== value) {
      tsconfig.compilerOptions[option] = value;
      messages.push(
        `${chalk.cyan('compilerOptions.' + option)} ${chalk.bold(
          'must'
        )} be ${chalk.cyan.bold(value)}` +
          (reason != null ? ` (${reason})` : '')
      );
    }
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

  // Copy type declarations associated with this version of `react-scripts`
  const declaredTypes = path.resolve(
    __dirname,
    '..',
    '..',
    'config',
    'react-app.d.ts'
  );
  const declaredTypesContent = fs
    .readFileSync(declaredTypes, 'utf8')
    .replace(/\/\/ @remove-file-on-eject\r?\n/, '');
  fs.writeFileSync(
    path.resolve(paths.appSrc, 'react-app.d.ts'),
    declaredTypesContent
  );
}

module.exports = verifyTypeScriptSetup;
