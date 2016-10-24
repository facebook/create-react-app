/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const ProgressPlugin = require('webpack').ProgressPlugin;
const ProgressBar = require('progress');
const chalk = require('chalk');

function BuildProgressPlugin() {
  const bar = new ProgressBar(`  [:bar] ${chalk.bold(':percent')} ${chalk.yellow(':etas')} (${chalk.dim(':msg')})`, {
    total: 100,
    complete: '=',
    incomplete: ' ',
    width: 25
  })
  return new ProgressPlugin(function(percent, msg) {
    if (percent === 1) msg = 'completed';
    bar.update(percent, { msg: msg });
    if (percent === 1) bar.terminate();
  });
}

module.exports = BuildProgressPlugin;
