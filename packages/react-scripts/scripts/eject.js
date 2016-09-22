/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var createJestConfig = require('./utils/createJestConfig');
var fs = require('fs');
var path = require('path');
var prompt = require('./utils/prompt');
var rimrafSync = require('rimraf').sync;
var spawnSync = require('cross-spawn').sync;

prompt(
  'Are you sure you want to eject? This action is permanent.',
  false
).then(shouldEject => {
  if (!shouldEject) {
    console.log('Close one! Eject aborted.');
    process.exit(1);
  }

  console.log('Ejecting...');
  console.log();

  var ownPath = path.join(__dirname, '..');
  var appPath = path.join(ownPath, '..', '..');
  var files = [
    '.eslintrc',
    path.join('config', 'babel.dev.js'),
    path.join('config', 'babel.prod.js'),
    path.join('config', 'flow', 'css.js.flow'),
    path.join('config', 'flow', 'file.js.flow'),
    path.join('config', 'paths.js'),
    path.join('config', 'env.js'),
    path.join('config', 'polyfills.js'),
    path.join('config', 'webpack.config.dev.js'),
    path.join('config', 'webpack.config.prod.js'),
    path.join('config', 'jest', 'CSSStub.js'),
    path.join('config', 'jest', 'FileStub.js'),
    path.join('config', 'jest', 'transform.js'),
    path.join('scripts', 'build.js'),
    path.join('scripts', 'start.js'),
    path.join('scripts', 'utils', 'checkRequiredFiles.js'),
    path.join('scripts', 'utils', 'chrome.applescript'),
    path.join('scripts', 'utils', 'getClientEnvironment.js'),
    path.join('scripts', 'utils', 'InterpolateHtmlPlugin.js'),
    path.join('scripts', 'utils', 'prompt.js'),
    path.join('scripts', 'utils', 'WatchMissingNodeModulesPlugin.js')
  ];

  // Ensure that the app folder is clean and we won't override any files
  files.forEach(function(file) {
    if (fs.existsSync(path.join(appPath, file))) {
      console.error(
        '`' + file + '` already exists in your app folder. We cannot ' +
        'continue as you would lose all the changes in that file or directory. ' +
        'Please delete it (maybe make a copy for backup) and run this ' +
        'command again.'
      );
      process.exit(1);
    }
  });

  // Copy the files over
  fs.mkdirSync(path.join(appPath, 'config'));
  fs.mkdirSync(path.join(appPath, 'config', 'flow'));
  fs.mkdirSync(path.join(appPath, 'config', 'jest'));
  fs.mkdirSync(path.join(appPath, 'scripts'));
  fs.mkdirSync(path.join(appPath, 'scripts', 'utils'));

  files.forEach(function(file) {
    console.log('Copying ' + file + ' to ' + appPath);
    var content = fs
      .readFileSync(path.join(ownPath, file), 'utf8')
      // Remove dead code from .js files on eject
      .replace(/\/\/ @remove-on-eject-begin([\s\S]*?)\/\/ @remove-on-eject-end/mg, '')
      // Remove dead code from .applescript files on eject
      .replace(/-- @remove-on-eject-begin([\s\S]*?)-- @remove-on-eject-end/mg, '')
      .trim() + '\n';
    fs.writeFileSync(path.join(appPath, file), content);
  });
  console.log();

  var ownPackage = require(path.join(ownPath, 'package.json'));
  var appPackage = require(path.join(appPath, 'package.json'));

  console.log('Removing dependency: react-scripts');
  delete appPackage.devDependencies['react-scripts'];

  Object.keys(ownPackage.dependencies).forEach(function (key) {
    // For some reason optionalDependencies end up in dependencies after install
    if (ownPackage.optionalDependencies[key]) {
      return;
    }
    console.log('Adding dependency: ' + key);
    appPackage.devDependencies[key] = ownPackage.dependencies[key];
  });

  console.log('Updating scripts');
  delete appPackage.scripts['eject'];
  Object.keys(appPackage.scripts).forEach(function (key) {
    appPackage.scripts[key] = appPackage.scripts[key]
      .replace(/react-scripts test/g, 'jest --watch')
      .replace(/react-scripts (\w+)/g, 'node scripts/$1.js');
  });

  // Add Jest config
  appPackage.jest = createJestConfig(
    filePath => path.join('<rootDir>', filePath)
  );

  console.log('Writing package.json');
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );
  console.log();

  console.log('Running npm install...');
  rimrafSync(ownPath);
  spawnSync('npm', ['install'], {stdio: 'inherit'});
  console.log('Ejected successfully!');
  console.log();

  console.log('Please consider sharing why you ejected in this survey:');
  console.log('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1');
  console.log();
});
