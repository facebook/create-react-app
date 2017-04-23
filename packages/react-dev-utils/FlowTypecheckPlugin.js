/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const childProcess = require('child_process');
const flowBinPath = require('flow-bin');

function exec(command, args, options) {
  return new Promise((resolve, reject) => {
    var stdout = new Buffer('');
    var stderr = new Buffer('');
    var oneTimeProcess = childProcess.spawn(command, args, options);
    oneTimeProcess.stdout.on('data', chunk => {
      stdout = Buffer.concat([stdout, chunk]);
    });
    oneTimeProcess.stderr.on('data', chunk => {
      stderr = Buffer.concat([stderr, chunk]);
    });
    oneTimeProcess.on('error', error => reject(error));
    oneTimeProcess.on('exit', code => {
      switch (code) {
        case 0: {
          return resolve(stdout);
        }
        default: {
          return reject(new Error(Buffer.concat([stdout, stderr]).toString()));
        }
      }
    });
  });
}

function formatFlowErrors(error) {
  return error
    .toString()
    .split('\n')
    .filter(line => {
      return !(/flow is still initializing/.test(line) ||
        /Found \d+ error/.test(line));
    })
    .map(line => line.replace(/^Error:\s*/, ''))
    .join('\n');
}

class FlowTypecheckPlugin {
  constructor(options) {
    this.shouldRun = false;
    this.flowStarted = false;
  }

  startFlow(cwd) {
    if (this.flowStarted) {
      return Promise.resolve();
    }
    const flowConfigPath = path.join(cwd, '.flowconfig');
    return new Promise((resolve, reject) => {
      fs.access(flowConfigPath, fs.constants.R_OK | fs.constants.W_OK, err => {
        if (err) {
          resolve(exec(flowBinPath, ['init'], { cwd }));
        } else {
          resolve();
        }
      });
    })
      .then(() =>
        exec(flowBinPath, ['stop'], { cwd }).then(() =>
          exec(flowBinPath, ['start'], { cwd })))
      .then(() => {
        this.flowStarted = true;
      });
  }

  apply(compiler) {
    compiler.plugin('compile', () => {
      this.shouldRun = false;
    });

    compiler.plugin('compilation', compilation => {
      compilation.plugin('normal-module-loader', (loaderContext, module) => {
        if (
          this.shouldRun ||
          module.resource.indexOf('node_modules') !== -1 ||
          !/[.]js(x)?$/.test(module.resource)
        ) {
          return;
        }
        const contents = loaderContext.fs.readFileSync(module.resource, 'utf8');
        if (
          /^\s*\/\/.*@flow/.test(contents) || /^\s*\/\*.*@flow/.test(contents)
        ) {
          this.shouldRun = true;
        }
      });
    });

    // Run lint checks
    compiler.plugin('emit', (compilation, callback) => {
      if (!this.shouldRun) {
        callback();
        return;
      }
      const cwd = compiler.options.context;
      this.startFlow(cwd)
        .then(() => {
          exec(flowBinPath, ['status', '--color=always'], { cwd })
            .then(() => {
              callback();
              //TODO: flow ran, and there was no errors
            })
            .catch(e => {
              compilation.warnings.push(formatFlowErrors(e));
              callback();
            });
        })
        .catch(e => {
          //TODO: flow failed, set a warning
          callback();
        });
    });
  }
}

module.exports = FlowTypecheckPlugin;
