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

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const paths = require('../config/paths');
const chalk = require('chalk');
const appPackage = require(paths.appPackageJson);

const exec = require('child_process').exec;

const source = 'build/';
const destination = `s3://vtex-io-us/${appPackage.name}`;
const cmd = `aws s3 cp --recursive ${source} ${destination}`;

console.log();
console.log(`Deploying ${appPackage.name}`);
console.log(`To: ${destination}`);
console.log();

exec(cmd, err => {
  if (err) {
    console.log(chalk.yellow('Error while deploying.\n'));
    console.log(chalk.yellow(err));
  } else {
    console.log(chalk.green('Deployed successfully.\n'));
  }
});
