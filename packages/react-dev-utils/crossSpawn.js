/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { spawn, spawnSync } = require('child_process');

function normalizeSpawnArguments(file, args, options) {
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

  return { file, args, options };
}

function crossSpawn(file, args, options) {
  ({ file, args, options } = normalizeSpawnArguments(file, args, options));
  return spawn(file, args, options);
}

crossSpawn.sync = function crossSpawnSync(file, args, options) {
  ({ file, args, options } = normalizeSpawnArguments(file, args, options));
  return spawnSync(file, args, options);
};

module.exports = crossSpawn;
