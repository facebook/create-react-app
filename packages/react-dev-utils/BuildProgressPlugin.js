'use strict';

const path = require('path');

const ProgressPlugin = require('webpack').ProgressPlugin;
const ProgressBar = require('progress');
const chalk = require('chalk');

function BuildProgressPlugin() {
  const bar = new ProgressBar(`  [:bar] ${ chalk.bold(':percent') } ${ chalk.yellow(':etas') } (${ chalk.dim(':msg') })`, {
    total: 100,
    complete: '=',
    incomplete: ' ',
    width: 25
  });
  return new ProgressPlugin(function (percent, msg) {
    if (percent === 1) msg = 'completed';
    bar.update(percent, { msg });
    if (percent === 1) bar.terminate();
  });
}

module.exports = BuildProgressPlugin;
