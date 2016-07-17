/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs');

console.log('Extracting scripts...');

var hostPath = __dirname;
var selfPath = hostPath + '/node_modules/create-react-app-scripts';

var files = [
  'scripts',
  '.webpack.config.dev.js',
  '.webpack.config.prod.js',
  '.babelrc',
  '.eslintrc',
];

// Ensure that the host folder is clean and we won't override any files
files.forEach(function(file) {
  if (fs.existsSync(hostPath + '/' + file)) {
    console.error(
      '`' + file + '` already exists on your app folder, we cannot ' +
      'continue as you would lose all the changes in that file.',
      'Please delete it (maybe make a copy for backup) and run this ' +
      'command again.'
    );
    process.exit(1);
  }
});

// Move the files over
files.forEach(function(file) {
  fs.renameSync(selfPath + '/' + file, hostPath + '/' + file);
});

var hostPackage = require(hostPath + '/package.json');

console.log('Done!');
