/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs');

module.exports = function(hostPath, appName) {
  var selfPath = hostPath + '/node_modules/create-react-app-scripts';

  var hostPackage = require(hostPath + '/package.json');
  var selfPackage = require(selfPath + '/package.json');

  // Copy over devDependencies
  hostPackage.dependencies = hostPackage.dependencies || {};
  for (var key in selfPackage.devDependencies) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key];
  }

  // Setup the script rules
  hostPackage.scripts = {};
  ['start', 'build'].forEach(function(command) {
    hostPackage.scripts[command] =
      'node node_modules/create-react-app-scripts/scripts/' + command + '.js';
  });

  fs.writeFileSync(hostPath + '/package.json', JSON.stringify(hostPackage, null, 2));

  // TODO: run npm install in hostPath, (not needed for npm 3 if we accept some hackery)

  // Move the src folder
  fs.renameSync(selfPath + '/src', hostPath + '/src');

  console.log('Creating the app', appName, 'at', hostPath);
};
