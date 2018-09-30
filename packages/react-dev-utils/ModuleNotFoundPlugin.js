/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');
const findUp = require('find-up');
const path = require('path');

class ModuleNotFoundPlugin {
  constructor(appPath, yarnLockFile) {
    this.appPath = appPath;
    this.yarnLockFile = yarnLockFile;

    this.useYarnCommand = this.useYarnCommand.bind(this);
    this.prettierError = this.prettierError.bind(this);
  }

  useYarnCommand() {
    try {
      return findUp.sync('yarn.lock', { cwd: this.appPath }) != null;
    } catch (_) {
      return false;
    }
  }

  prettierError(err) {
    const { details: _details, origin } = err;

    // Format the file to be a relative path (if possible)
    let file = path.relative(this.appPath, origin.resource);
    if (file.startsWith('..')) {
      file = origin.resource;
    } else if (!file.startsWith('.')) {
      file = '.' + path.sep + file;
    }

    let details = _details.split('\n');
    const isModule = details[1] && /module/.test(details[1]);
    const request = /resolve '(.*?)' in '(.*?)'/.exec(details);
    if (request) {
      const isYarn = this.useYarnCommand();
      const [, target] = request;
      if (isModule) {
        details = [
          `Cannot find module: '${target}'. Make sure this package is installed.`,
          '',
          'You can install this package by running: ' +
            (isYarn
              ? chalk.bold(`yarn add ${target}`)
              : chalk.bold(`npm install ${target}`)) +
            '.',
        ];
      } else {
        details = [err.message];
      }
    } else {
      details = [err.message];
    }
    err.message = [file, ...details].join('\n').replace('Error: ', '');
    return err;
  }

  apply(compiler) {
    const { prettierError } = this;
    compiler.hooks.make.intercept({
      register(tap) {
        if (
          !(tap.name === 'MultiEntryPlugin' || tap.name === 'SingleEntryPlugin')
        ) {
          return tap;
        }
        return Object.assign({}, tap, {
          fn: (compilation, callback) => {
            tap.fn(compilation, (err, ...args) => {
              if (err && err.name === 'ModuleNotFoundError') {
                err = prettierError(err);
              }
              callback(err, ...args);
            });
          },
        });
      },
    });
  }
}

module.exports = ModuleNotFoundPlugin;
