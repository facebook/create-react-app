/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { spawn } = require('child_process');

function crossSpawn(file, args, options) {
  if (typeof file !== 'string' || file.length === 0) {
    throw new TypeError('"file" argument must be a non-empty string');
  }

  if (Array.isArray(args)) {
    args = args.slice(0);
  } else if (
    args !== undefined &&
    (args === null || typeof args !== 'object')
  ) {
    throw new TypeError('Incorrect value of args option');
  } else {
    options = args;
    args = [];
  }

  if (options === undefined) {
    options = {};
  } else if (options === null || typeof options !== 'object') {
    throw new TypeError('"options" argument must be an object');
  }

  // Default to using a shell on Windows
  if (options.shell === undefined && process.platform === 'win32') {
    options.shell = true;
  }
  return spawn(file, args, options);
}

module.exports = crossSpawn;
