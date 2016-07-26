/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'test';

var path = require('path');
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var Mocha = require('mocha');
var mocha = new Mocha();
var paths = require('../config/paths');
var config = require('../config/webpack.config.test');

var tmpPath = paths.appTmp;
rimrafSync(tmpPath);

webpack(config).run(function(err, stats) {
  if (err) {
    console.error('Failed to create a test build. Reason:');
    console.error(err.message || err);
    process.exit(1);
  }

  mocha.addFile(path.join(tmpPath, 'testBundle.js'))

  mocha.run(function(failures){
    process.on('exit', function () {
      process.exit(failures);
    });
  });
});
