'use strict';

const path = require('path');

const ProgressPlugin = require('webpack').ProgressPlugin;
const ProgressBar = require('progress');
const chalk = require('chalk');

function BuildProgressPlugin() {
  if (process.env.CI) {
    return new ProgressPlugin(function handler(percentage, msg) {
      // noop
    })
  }
  const bar = new ProgressBar(`  [:bar] ${ chalk.bold(':percent') } ${ chalk.yellow(':etas') } (${ chalk.dim(':msg') })`, {
    total: 100,
    complete: '=',
    incomplete: ' ',
    width: 25
  });
  return new ProgressPlugin(function handler(percent, msg) {
    const done = percent === 1;
    if (done) {
      msg = 'completed';
    }
    bar.update(percent, { msg });
    if (done) {
      bar.terminate();
    }
  });
}

module.exports = BuildProgressPlugin;
