/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'production';

var path = require('path');
var spawnSync = require('child_process').spawnSync;
var webpack = require('webpack');
var config = require('../webpack.config.prod');

var isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..', '..')));
var relative = isInNodeModules ? '../..' : '.';
spawnSync('rm', ['-rf', relative + '/build']);

webpack(config).run(function(err, stats) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('Build successfully generated in the build/ folder');
});
