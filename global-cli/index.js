#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// create-react-app is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// The only job of create-react-app is to init the repository and then
// forward all the commands to the local version of create-react-app.
//
// If you need to add a new command, please add it to local-cli/.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `react init` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of create-react-app.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var chalk = require('chalk');
var semver = require('semver');
/**
 * Used arguments:
 *   -v --version - to print current version of create-react-app and create-react-app-scripts dependency
 *   --verbose - to print logs while init
 *   --scripts-version <alternative create-react-app-scripts package> - override default (https://registry.npmjs.org/create-react-app-scripts@latest),
 *      package to install, examples:
 *     - "0.22.0-rc1" - A new app will be created using a specific version of React CLI from npm repo
 *     - "https://registry.npmjs.org/create-react-app-scripts/-/create-react-app-scripts-0.20.0.tgz" - a .tgz archive from any npm repo
 *     - "/Users/home/create-react-app/create-react-app-scripts-0.22.0.tgz" - for package prepared with `npm pack`, useful for e2e tests
 */
var argv = require('minimist')(process.argv.slice(2));

var commands = argv._;
if (commands.length === 0) {
  console.error(
    'Usage: create-react-app <project-name> [--verbose]'
  );
  process.exit(1);
}

if (argv.v || argv.version) {
  console.log('create-react-app: ' + require('./package.json').version);
  process.exit();
}

createApp(commands[0], argv.verbose, argv['scripts-version']);

function createApp(name, verbose, version) {
  if (fs.existsSync(name)) {
    console.log('Directory `' + name + '` already exists. Aborting.');
    process.exit();
  }

  var root = path.resolve(name);
  var appName = path.basename(root);

  console.log(
    'This will walk you through creating a new React app in',
    root
  );

  fs.mkdirSync(root);

  var packageJson = {
    name: appName,
    version: '0.0.1',
    private: true,
  };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson));
  process.chdir(root);

  console.log('Installing create-react-app-scripts package from npm...');

  run(root, appName, version, verbose);
}

function run(root, appName, version, verbose) {
  var args = [
    'install',
    verbose && '--verbose',
    '--save',
    '--save-exact',
    getInstallPackage(version),
  ].filter(function(e) { return e; });
  var proc = spawn('npm', args, {stdio: 'inherit'});
  proc.on('close', function (code) {
    if (code !== 0) {
      console.error('`npm ' + args.join(' ') + '` failed');
      return;
    }

    var scriptsPath = path.resolve(
      process.cwd(),
      'node_modules',
      'create-react-app-scripts',
      'init.js'
    );
    var init = require(scriptsPath);
    init(root, appName);
  });
}

function getInstallPackage(version) {
  var packageToInstall = 'create-react-app-scripts';
  var validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += '@' + validSemver;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}

function checkNodeVersion() {
  var packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    'create-react-app-scripts',
    'package.json'
  );
  var packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }
  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are currently running Node %s but React CLI requires %s. ' +
        'Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    );
  }
}
