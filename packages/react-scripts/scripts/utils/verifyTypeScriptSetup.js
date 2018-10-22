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

function verifyTypeScriptSetup() {
  if (!paths.appIndexJs.endsWith('.tsx')) {
    return;
  }

  if (!fs.existsSync(paths.appTsConfig)) {
    fs.writeFileSync(
      paths.appTsConfig,
      JSON.stringify(defaultTSConfig, null, 2),
      'utf-8'
    );
  }

  const isYarn = fs.existsSync(paths.yarnLockFile);

  function findTypeScript() {
    return resolve.sync('typescript', {
      basedir: paths.appNodeModules,
    });
  }

  // Ensure typescript is installed
  try {
    findTypeScript();
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

  const ts = require(findTypeScript());
  // Read the contents of the config file
  // Note that this function doesn't merge in "extends" config
  const result = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile);

  if (result.error) {
    console.error(
      'There was an error while trying to parse your ' +
        chalk.cyan('tsconfig.json') +
        ' file. Please ensure the contents are valid.'
    );
    console.error();
    console.error(chalk.red(result.error.messageText));
    console.error();
    process.exit(1);
  }

  // Parse json, merge config extending others, ...
  const parsedResult = ts.parseJsonConfigFileContent(
    result.config,
    ts.sys,
    // TODO: paths.appPath is '/packages/react-scripts' when developing. Can we do something cleaner?
    // A root directory to resolve relative path entries in the config
    path.resolve(paths.appSrc, '..')
  );

  if (parsedResult.errors.length) {
    console.error(
      'There were errors while trying to parse your ' +
        chalk.cyan('tsconfig.json') +
        ' file. Please ensure the contents are valid.'
    );
    console.error();

    for (const error of parsedResult.errors) {
      console.error(chalk.red(error.messageText));
      console.error();
    }

    process.exit(1);
  }

  const compilerOptions = parsedResult.options;

  if (compilerOptions.isolatedModules !== true) {
    console.error(
      'We detected that ' +
        chalk.bold('isolatedModules') +
        ' was not set to ' +
        chalk.bold('true') +
        ' in your ' +
        chalk.cyan('tsconfig.json') +
        ' file. Please update your configuration and try again.'
    );
    console.error();
    process.exit(1);
  }
}

module.exports = verifyTypeScriptSetup;

const defaultTSConfig = {
  compilerOptions: {
    target: 'es5',
    module: 'esnext',
    moduleResolution: 'node',
    lib: ['esnext', 'dom', 'dom.iterable'],
    allowJs: true,
    allowSyntheticDefaultImports: true,
    esModuleInterop: true,
    isolatedModules: true,
    jsx: 'preserve',
    noEmit: true,
    skipLibCheck: true,
    strict: true,
  },
  include: ['src'],
};
