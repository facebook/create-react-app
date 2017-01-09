/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var createJestConfig = require('../utils/createJestConfig');
var fs = require('fs-extra');
var path = require('path');
var paths = require('../config/paths');
var prompt = require('react-dev-utils/prompt');
var spawnSync = require('cross-spawn').sync;
var chalk = require('chalk');
var green = chalk.green;
var cyan = chalk.cyan;

prompt(
  'Are you sure you want to eject? This action is permanent.',
  false
).then(shouldEject => {
  if (!shouldEject) {
    console.log(cyan('Close one! Eject aborted.'));
    process.exit(1);
  }

  console.log('Ejecting...');

  var ownPath = path.join(__dirname, '..');
  var appPath = path.join(ownPath, '..', '..');

  function verifyAbsent(file) {
    if (fs.existsSync(path.join(appPath, file))) {
      console.error(
        '`' + file + '` already exists in your app folder. We cannot ' +
        'continue as you would lose all the changes in that file or directory. ' +
        'Please move or delete it (maybe make a copy for backup) and run this ' +
        'command again.'
      );
      process.exit(1);
    }
  }

  var folders = [
    'config',
    path.join('config', 'jest'),
    'scripts'
  ];

  var files = [
    path.join('config', 'env.js'),
    path.join('config', 'paths.js'),
    path.join('config', 'polyfills.js'),
    path.join('config', 'webpack.config.dev.js'),
    path.join('config', 'webpack.config.prod.js'),
    path.join('config', 'jest', 'cssTransform.js'),
    path.join('config', 'jest', 'fileTransform.js'),
    path.join('scripts', 'build.js'),
    path.join('scripts', 'start.js'),
    path.join('scripts', 'test.js')
  ];

  // Ensure that the app folder is clean and we won't override any files
  folders.forEach(verifyAbsent);
  files.forEach(verifyAbsent);

  // Copy the files over
  folders.forEach(function(folder) {
    fs.mkdirSync(path.join(appPath, folder))
  });

  console.log();
  console.log(cyan('Copying files into ' + appPath));
  files.forEach(function(file) {
    console.log('  Adding ' + cyan(file) + ' to the project');
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
  var babelConfig = JSON.parse(fs.readFileSync(path.join(ownPath, '.babelrc'), 'utf8'));
  var eslintConfig = JSON.parse(fs.readFileSync(path.join(ownPath, '.eslintrc'), 'utf8'));

  console.log(cyan('Updating the dependencies'));
  var ownPackageName = ownPackage.name;
  console.log('  Removing ' + cyan(ownPackageName) + ' from devDependencies');
  delete appPackage.devDependencies[ownPackageName];

  Object.keys(ownPackage.dependencies).forEach(function (key) {
    // For some reason optionalDependencies end up in dependencies after install
    if (ownPackage.optionalDependencies[key]) {
      return;
    }
    console.log('  Adding ' + cyan(key) + ' to devDependencies');
    appPackage.devDependencies[key] = ownPackage.dependencies[key];
  });
  console.log();
  console.log(cyan('Updating the scripts'));
  delete appPackage.scripts['eject'];
  Object.keys(appPackage.scripts).forEach(function (key) {
    appPackage.scripts[key] = appPackage.scripts[key]
      .replace(/react-scripts (\w+)/g, 'node scripts/$1.js');
    console.log(
      '  Replacing ' +
      cyan('"react-scripts ' + key + '"') +
      ' with ' +
      cyan('"node scripts/' + key + '.js"')
    );
  });

  console.log();
  console.log(cyan('Configuring package.json'));
  // Add Jest config
  console.log('  Adding ' + cyan('Jest') + ' configuration');
  appPackage.jest = createJestConfig(
    filePath => path.join('<rootDir>', filePath),
    null,
    true
  );

  // Add Babel config

  console.log('  Adding ' + cyan('Babel') + ' preset');
  appPackage.babel = babelConfig;

  // Add ESlint config
  console.log('  Adding ' + cyan('ESLint') +' configuration');
  appPackage.eslintConfig = eslintConfig;

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );
  console.log();

  if (fs.existsSync(paths.yarnLockFile)) {
    console.log(cyan('Running yarn...'));
    fs.removeSync(ownPath);
    spawnSync('yarnpkg', [], {stdio: 'inherit'});
  } else {
    console.log(cyan('Running npm install...'));
    fs.removeSync(ownPath);
    spawnSync('npm', ['install'], {stdio: 'inherit'});
  }
  console.log(green('Ejected successfully!'));
  console.log();

  console.log(green('Please consider sharing why you ejected in this survey:'));
  console.log(green('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1'));
  console.log()
})
