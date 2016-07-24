/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');

module.exports = function(hostPath, appName, verbose) {
  var selfPath = path.join(hostPath, 'node_modules', 'react-scripts');

  var hostPackage = require(path.join(hostPath, 'package.json'));
  var selfPackage = require(path.join(selfPath, 'package.json'));

  // Copy over some of the devDependencies
  hostPackage.dependencies = hostPackage.dependencies || {};
  ['react', 'react-dom'].forEach(function (key) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key];
  });

  // Setup the script rules
  hostPackage.scripts = {};
  ['start', 'build', 'eject'].forEach(function(command) {
    hostPackage.scripts[command] = 'react-scripts ' + command;
  });

  // explicitly specify ESLint config path for editor plugins
  hostPackage.eslintConfig = {
    extends: './node_modules/react-scripts/config/eslint.js',
  };

  fs.writeFileSync(
    path.join(hostPath, 'package.json'),
    JSON.stringify(hostPackage, null, 2)
  );

  // Copy the files for the user
  fs.copySync(path.join(selfPath, 'template'), hostPath);

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  fs.move(path.join(hostPath, 'gitignore'), path.join(hostPath, '.gitignore'), []);

  // Run another npm install for react and react-dom
  console.log('Installing react and react-dom from npm...');
  // TODO: having to do two npm installs is bad, can we avoid it?
  var args = [
    'install',
    verbose && '--verbose'
  ].filter(function(e) { return e; });
  var proc = spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`npm ' + args.join(' ') + '` failed');
      return;
    }

    // Make sure to display the right way to cd
    var cdpath;
    if (path.join(process.cwd(), appName) === hostPath) {
      cdpath = appName;
    } else {
      cdpath = hostPath;
    }

    console.log('Success! Created ' + appName + ' at ' + hostPath + '.');
    console.log();
    console.log('Inside that directory, you can run several commands:');
    console.log('  * npm start: Starts the development server.');
    console.log('  * npm run build: Bundles the app into static files for production.');
    console.log('  * npm run eject: Removes this tool. If you do this, you can’t go back!');
    console.log();
    console.log('We suggest that you begin by typing:');
    console.log('  cd', cdpath);
    console.log('  npm start');
    console.log();
    console.log('Happy hacking!');
  });
};
