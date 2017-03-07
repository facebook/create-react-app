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
"use strict"
process.env.NODE_ENV = "development";

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require("dotenv").config({ silent: true });

var chalk = require("chalk");
var fs = require("fs-extra");
var webpack = require("webpack");

var config = require("../config/webpack.config.watch");
var paths = require("../config/paths");

var clearConsole = require("react-dev-utils/clearConsole");
var checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
var formatWebpackMessages = require("react-dev-utils/formatWebpackMessages");
var cleanBuildFolder = require("react-dev-utils/cleanBuildFolder");

var FileSizeReporter = require("react-dev-utils/FileSizeReporter");
var measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
var printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

var useYarn = fs.existsSync(paths.yarnLockFile);
var cli = useYarn ? "yarn" : "npm";
var isInteractive = process.stdout.isTTY;
var echo = console.log; //alias console.log for easier printing

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
  // Start the webpack watch mode
  watch(previousFileSizes);
}).catch(console.log)

function watch(previousFileSizes) {
  clearConsoleIfInteractive();
  var isFirstCompile = true;
  var watcher = webpack(config, () => {});
  var compiler = watcher.compiler;

  echo("Compiling " + process.env.NODE_ENV + " build...");
  compiler.plugin("done", createCompilerDoneHandler(previousFileSizes, isFirstCompile));
  compiler.plugin("invalid", handleCompilerInvalid);
}

function handleCompilerInvalid() {
  clearConsoleIfInteractive();

  echo("Compiling...");
}

function createCompilerDoneHandler(previousFileSizes, isFirstCompile) {
  return stats => {
    clearConsoleIfInteractive();
    cleanUpAndPrintMessages(stats, previousFileSizes, isFirstCompile);
  };
}

function cleanUpAndPrintMessages(stats, previousFileSizes, isFirstCompile) {
  cleanBuildFolder(paths.appBuild, stats).then(removedFiles => {
    if (removedFiles.length){
      console.log('Deleting up old assets in the build folder:\n', removedFiles.join('\n'))
    }
    copyPublicFolder(); // Update public folder


    var messages = formatWebpackMessages(stats.toJson({}, true));
    var isSuccessful = !messages.errors.length && !messages.warnings.length;

    if (isSuccessful) {
      printWatchSuccessMessage(messages, stats, previousFileSizes, isFirstCompile);
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
}

function printErrors(messages) {
  echo(chalk.red("Failed to compile."));
  echo();
  messages.errors.forEach(message => {
    echo(message);
    echo();
  });
}

function printWatchSuccessMessage(messages, stats, previousFileSizes, isFirstCompile) {
  echo(
    [
      chalk.green(
        "Successfully compiled a " + process.env.NODE_ENV + " build."
      ),
      "",
      "You can access the compiled files in",
      paths.appBuild,
      "",
      "File sizes after gzip:",
      ""
    ].join("\n")
  );
  printFileSizesAfterBuild(stats, previousFileSizes);
  if (isFirstCompile) {
    echo(
      chalk.yellow(
        [
          "",
          "Note that running in watch mode is slower and only recommended if you need to",
          "serve the assets with your own back-end in development.",
          ""
        ].join("\n")
      )
    );
    echo(
      "To create a development server, use " + chalk.cyan(cli + " start") + "."
    );
    isFirstCompile = false;
  }
}

function printWarnings(messages) {
  echo(chalk.yellow("Compiled with warnings."));
  echo();
  messages.warnings.forEach(message => {
    echo(message);
    echo();
  });
  // Teach some ESLint tricks.
  echo("You may use special comments to disable some warnings.");
  echo(
    "Use " +
      chalk.yellow("// eslint-disable-next-line") +
      " to ignore the next line."
  );
  echo(
    "Use " +
      chalk.yellow("/* eslint-disable */") +
      " to ignore all warnings in a file."
  );
}

function clearConsoleIfInteractive() {
  if (isInteractive) {
    clearConsole();
  }
}

function printWaitingChanges() {
  echo();
  echo(
    "Waiting for changes in",
    paths.appSrc.replace(process.cwd(), ".") + "/"
  );
}



function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  });
}
