/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'development';

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('../webpack.config.dev');
var execSync = require('child_process').execSync;

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  historyApiFallback: true,
  stats: {
    hash: false,
    version: false,
    timings: false,
    assets: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    publicPath: false,
    colors: true,
    errors: true,
    errorDetails: true,
    warnings: true,
  }
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }
  console.log('Listening at http://localhost:3000/');

  try {
    execSync('ps cax | grep "Google Chrome"');
    execSync('open -a "Google Chrome" http://localhost:3000/');
  } catch(e) {
    // Do nothing if Chrome isn't opened or cannot be opened
  }
});
