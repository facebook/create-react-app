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
var rl = require('readline');
var rimrafSync = require('rimraf').sync;
var spawnSync = require('child_process').spawnSync;

var prompt = function(question, cb) {
  var rlInterface = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rlInterface.question(question + '\n', function(answer) {
    rlInterface.close();
    cb(answer);
  })
}

prompt('Are you sure you want to eject? This action is permanent. [y/N]', function(answer) {
  var shouldEject = answer && (
    answer.toLowerCase() === 'y' ||
    answer.toLowerCase() === 'yes'
  );
  if (!shouldEject) {
    console.log('Close one! Eject aported.');
    process.exit(1);
  }

  console.log('Ejecting...');
  console.log();
  var selfPath = path.join(__dirname, '..');
  var hostPath = path.join(selfPath, '..', '..');

  var files = [
    path.join('config', 'babel.dev.js'),
    path.join('config', 'babel.prod.js'),
    path.join('config', 'eslint.js'),
    path.join('config', 'webpack.config.dev.js'),
    path.join('config', 'webpack.config.prod.js'),
    path.join('scripts', 'build.js'),
    path.join('scripts', 'start.js')
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

  // Copy the files over
  fs.mkdirSync(path.join(hostPath, 'config'));
  fs.mkdirSync(path.join(hostPath, 'scripts'));

  files.forEach(function(file) {
   console.log('Copying ' + file + ' to ' + hostPath);
   var content = fs.readFileSync(path.join(selfPath, file), 'utf8');
   // Remove license header
   content = content.replace(/^\/\*\*(\*(?!\/)|[^*])*\*\//, '').trim() + '\n';
   fs.writeFileSync(path.join(hostPath, file), content);
  });

  console.log();

  var selfPackage = require(path.join(selfPath, 'package.json'));
  var hostPackage = require(path.join(hostPath, 'package.json'));

  console.log('Removing dependency: react-scripts');
  delete hostPackage.devDependencies['react-scripts'];

  Object.keys(selfPackage.dependencies).forEach(function (key) {
   console.log('Adding dependency: ' + key);
   hostPackage.devDependencies[key] = selfPackage.dependencies[key];
  });

  console.log('Updating scripts');
  Object.keys(hostPackage.scripts).forEach(function (key) {
    hostPackage.scripts[key] = 'node ./scripts/' + key + '.js'
  });
  delete hostPackage.scripts['eject'];

  console.log('Writing package.json');
  fs.writeFileSync(
   path.join(hostPath, 'package.json'),
   JSON.stringify(hostPackage, null, 2)
  );
  console.log();

  console.log('Running npm install...');
  rimrafSync(selfPath);
  spawnSync('npm', ['install'], {stdio: 'inherit'});
  console.log('Ejected successfully!');
  console.log();

  console.log('Please consider sharing why you ejected in this survey:');
  console.log('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1');
  console.log();

});
