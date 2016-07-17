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

module.exports = function(hostPath, appName) {
  var selfPath = path.join(hostPath, 'node_modules', 'create-react-app-scripts');

  var hostPackage = require(path.join(hostPath, 'package.json'));
  var selfPackage = require(path.join(selfPath, 'package.json'));

  // Copy over devDependencies
  hostPackage.dependencies = hostPackage.dependencies || {};
  for (var key in selfPackage.devDependencies) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key];
  }

  // Setup the script rules
  hostPackage.scripts = {};
  ['start', 'build', 'graduate'].forEach(function(command) {
    hostPackage.scripts[command] =
      command + '-react-app';
  });

  fs.writeFileSync(
    path.join(hostPath, 'package.json'),
    JSON.stringify(hostPackage, null, 2)
  );

  // TODO: run npm install in hostPath, (not needed for npm 3 if we accept some hackery)

  // Move the src folder
  fs.renameSync(path.join(selfPath, 'src'), path.join(hostPath, 'src'));

  console.log('Success! Created ' + appName + ' at ' + hostPath + '.');
  console.log();
  console.log('Inside that directory, you can run several commands:');
  console.log('  * npm start: Starts the development server.');
  console.log('  * npm run build: Builds the app for production.');
  console.log('  * npm run graduate: Removes this tool. If you do this, you can’t go back!');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log('  cd', appName);
  console.log('  npm start');
  console.log();
  console.log('Happy hacking!');
};
