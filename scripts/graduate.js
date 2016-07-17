/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

console.log('Graduating...');
console.log();

var selfPath = path.join(__dirname, '..');
var hostPath = path.join(selfPath, '..', '..');

var files = [
  'scripts',
  'webpack.config.dev.js',
  'webpack.config.prod.js',
  '.eslintrc'
];

// Ensure that the host folder is clean and we won't override any files
files.forEach(function(file) {
  if (fs.existsSync(path.join(hostPath, file))) {
    console.error(
      '`' + file + '` already exists in your app folder. We cannot ' +
      'continue as you would lose all the changes in that file or directory. ' +
      'Please delete it (maybe make a copy for backup) and run this ' +
      'command again.'
    );
    process.exit(1);
  }
});

// Move the files over
files.forEach(function(file) {
  console.log('Moving ' + file + ' to ' + hostPath);
  fs.renameSync(path.join(selfPath, file), path.join(hostPath, file));
});

// These are unnecessary after graduation
fs.unlinkSync(path.join(hostPath, 'scripts', 'init.js'));
fs.unlinkSync(path.join(hostPath, 'scripts', 'graduate.js'));

console.log();

var selfPackage = require(path.join(selfPath, 'package.json'));
var hostPackage = require(path.join(hostPath, 'package.json'));

console.log('Removing dependency: create-react-app-scripts');
delete hostPackage.devDependencies['create-react-app-scripts'];

Object.keys(selfPackage.dependencies).forEach(function (key) {
  console.log('Adding dependency: ' + key);
  hostPackage.devDependencies[key] = selfPackage.dependencies[key];
});

console.log('Updating scripts');
Object.keys(hostPackage.scripts).forEach(function (key) {
  hostPackage.scripts[key] = 'node ./scripts/' + key + '.js'
});
delete hostPackage.scripts['graduate'];

console.log('Writing package.json');
fs.writeFileSync(
  path.join(hostPath, 'package.json'),
  JSON.stringify(hostPackage, null, 2)
);
console.log();

console.log('Running npm install...');
spawnSync('rm', ['-rf', selfPath]);
spawnSync('npm', ['install'], {stdio: 'inherit'});
console.log();

console.log('Done!');
