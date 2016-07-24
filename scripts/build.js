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
var rimrafSync = require('rimraf').sync;
var webpack = require('webpack');
var config = require('../config/webpack.config.prod');

var isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..', '..')));
var relative = isInNodeModules ? '../..' : '.';
if (process.argv[2] === '--debug-template') {
  relative = './template';
}
rimrafSync(relative + '/build');

webpack(config).run(function(err, stats) {
  if (err) {
    console.error('Failed to create a production build. Reason:');
    console.error(err.message || err);
    process.exit(1);
  }

  var openCommand = process.platform === 'win32' ? 'start' : 'open';
  var homepagePath = require(path.resolve(relative, 'package.json')).homepage;
  console.log('Successfully generated a bundle in the build folder!');
  console.log();
  if (homepagePath) {
    console.log('You can now deploy and serve it from ' + homepagePath + '.');
  } else {
    console.log('You can now serve it with any static server, for example:');
    console.log('  cd build');
    console.log('  npm install -g http-server');
    console.log('  hs');
    console.log('  ' + openCommand + ' http://localhost:8080');
  }
  console.log();
  console.log('The bundle is optimized and ready to be deployed to production.');
});
