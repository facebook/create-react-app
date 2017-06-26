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

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development';
//process.env.NODE_ENV = 'development';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });
var chalk = require('chalk');
var webpack = require('webpack');
var config = require('../config/webpack.config.watch');
var clearConsole = require('react-dev-utils/clearConsole');

console.log(chalk.yellow("First compiling, please wait..."));
//Load webpack config and use watch option instead of run
webpack(config).watch({
  aggregateTimeout: 500, // wait so long for more changes
  poll: true // use polling instead of native watchers
}, (err, stats) => {
  if (err) { //if there's a fatal error  
    clearConsole();
    console.error(chalk.red('Failed to compile.'), [err]);
    return;
  }
  //if there are compiler errors
  else if (stats.hasErrors()) {
    clearConsole();
    //format error output: show colors, avoid warning messages, don't be verbose 
    let messages = stats.toString({ colors: true, warnings: false, chunks:false });
    //output messages to console
    console.error('Failed to compile->', messages);
    return;
  }
  // if there are no errors but warnings at compile time
  else if (stats.hasWarnings()) {
    clearConsole();
    //format webpack stats: show colors, don't be verbose
    let messages = stats.toString({ colors: true, chunks:false });
    //output messages to console including date and time of compiling 
    console.log(chalk.green("Compiled with warnings!"), (new Date()).toLocaleString());
    console.log(messages);
  }
  //if everything went fine
  else {
    //output date and time of compiling 
    console.log(chalk.green("Compiled successfully!"), (new Date()).toLocaleString());
  }

});
