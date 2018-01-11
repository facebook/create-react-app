// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';
process.env.NODE_ENV = 'development';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');

const config = require('../config/webpack.config.dev');
const paths = require('../config/paths');

const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const cleanBuildFolder = require('react-dev-utils/cleanBuildFolder');
const inquirer = require('inquirer');

const FileSizeReporter = require('react-dev-utils/FileSizeReporter');
const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

const useYarn = fs.existsSync(paths.yarnLockFile);
const cli = useYarn ? 'yarn' : 'npm';
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

const message = `Note that running in watch mode is slower and only recommended if you need to
serve the assets with your own back-end in development. It's not recommended if 
your use case is creating a single page application. Use npm start if that's the case. 
Also, don't deploy the code before running npm run build.`;

const question = `

Continue running in watching mode?

`;

clearConsoleIfInteractive();
inquirer
  .prompt({
    type: 'confirm',
    name: 'shouldChangePort',
    message: chalk.yellow(message) + question,
    default: true,
  })
  .then(accept => {
    if (accept) {
      run();
    } else {
      process.exit();
    }
  });

function run() {
  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  measureFileSizesBeforeBuild(paths.appBuild)
    .then(previousFileSizes => {
      // Start the webpack watch mode
      watch(previousFileSizes);
    })
    .catch(console.log);
}

const watchConfig = Object.assign({}, config, {
  watch: true,
  output: Object.assign({}, config.output, {
    path: paths.appBuild,
  }),
});

function watch(previousFileSizes) {
  clearConsoleIfInteractive();
  const watcher = webpack(watchConfig, () => {});
  const compiler = watcher.compiler;

  console.log('Compiling ' + process.env.NODE_ENV + ' build...');
  compiler.plugin('done', createCompilerDoneHandler(previousFileSizes));
  compiler.plugin('invalid', handleCompilerInvalid);
}

function handleCompilerInvalid() {
  clearConsoleIfInteractive();

  console.log('Compiling...');
}

function createCompilerDoneHandler(previousFileSizes) {
  return stats => {
    clearConsoleIfInteractive();
    cleanUpAndPrintMessages(stats, previousFileSizes);
  };
}

function cleanUpAndPrintMessages(stats, previousFileSizes) {
  cleanBuildFolder(paths.appBuild, stats)
    .then(removedFiles => {
      if (removedFiles.length) {
        console.log(
          'Deleting up old assets in the build folder:\n',
          removedFiles.join('\n')
        );
      }
      copyPublicFolder(); // Update public folder

      const messages = formatWebpackMessages(stats.toJson({}, true));
      const isSuccessful = !messages.errors.length && !messages.warnings.length;

      if (isSuccessful) {
        printWatchSuccessMessage(messages, stats, previousFileSizes);
        return printWaitingChanges();
      }

      // If errors exist, only print errors.
      if (messages.errors.length) {
        printErrors(messages);
        return printWaitingChanges();
      }

      // Print warnings if no errors were found.
      if (messages.warnings.length) {
        printWarnings(messages);
        return printWaitingChanges();
      }
    })
    .catch(error => {
      console.error(error);
    });
}

function printErrors(messages) {
  console.log(chalk.red('Failed to compile.'));
  console.log();
  messages.errors.forEach(message => {
    console.log(message);
    console.log();
  });
}

function printWatchSuccessMessage(messages, stats, previousFileSizes) {
  console.log(
    [
      chalk.green(
        'Successfully compiled a ' + process.env.NODE_ENV + ' build.'
      ),
      '',
      'You can access the compiled files in',
      '',
      '  ' + chalk.yellow(paths.appBuild),
      '',
      'File sizes after gzip:',
      '',
    ].join('\n')
  );
  printFileSizesAfterBuild(stats, previousFileSizes, paths.appBuild);
  console.log();
  console.log(
    'To start a development server, run `' + chalk.cyan(cli + ' start') + '`.'
  );
  console.log(
    'To create an optimized production build, run `' +
      chalk.cyan(cli + ' build') +
      '`.'
  );
}

function printWarnings(messages) {
  console.log(chalk.yellow('Compiled with warnings.'));
  console.log();
  messages.warnings.forEach(message => {
    console.log(message);
    console.log();
  });
  // Teach some ESLint tricks.
  console.log('You may use special comments to disable some warnings.');
  console.log(
    'Use ' +
      chalk.yellow('// eslint-disable-next-line') +
      ' to ignore the next line.'
  );
  console.log(
    'Use ' +
      chalk.yellow('/* eslint-disable */') +
      ' to ignore all warnings in a file.'
  );
}

function clearConsoleIfInteractive() {
  if (isInteractive) {
    clearConsole();
  }
}

function printWaitingChanges() {
  console.log();
  console.log(
    'Waiting for changes in',
    paths.appSrc.replace(process.cwd(), '.') + '/'
  );
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
