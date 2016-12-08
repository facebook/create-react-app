#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
// create-react-app is installed globally on people's computers. This means
// that it is extremely difficult to have them upgrade the version and
// because there's only one global version installed, it is very prone to
// breaking changes.
//
// The only job of create-react-app is to init the repository and then
// forward all the commands to the local version of create-react-app.
//
// If you need to add a new command, please add it to the scripts/ folder.
//
// The only reason to modify this file is to add more warnings and
// troubleshooting information for the `create-react-app` command.
//
// Do not make breaking changes! We absolutely don't want to have to
// tell people to update their global version of create-react-app.
//
// Also be careful with new language features.
// This file must work on Node 0.10+.
//
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//   /!\ DO NOT MODIFY THIS FILE /!\
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

'use strict';

var fs = require('fs');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');
var semver = require('semver');
var argv = require('minimist')(process.argv.slice(2));
var pathExists = require('path-exists');

/**
 * Arguments:
 *   --version - to print current version
 *   --verbose - to print logs while init
 *   --scripts-version <alternative package>
 *     Example of valid values:
 *     - a specific npm version: "0.22.0-rc1"
 *     - a .tgz archive from any npm repo: "https://registry.npmjs.org/react-scripts/-/react-scripts-0.20.0.tgz"
 *     - a package prepared with `tasks/clean_pack.sh`: "/Users/home/vjeux/create-react-app/react-scripts-0.22.0.tgz"
 */
var commands = argv._;
if (commands.length === 0) {
  if (argv.version) {
    console.log('create-react-app version: ' + require('./package.json').version);
    process.exit();
  }
  console.error(
    'Usage: create-react-app <project-directory> [--verbose]'
  );
  process.exit(1);
}

createApp(commands[0], argv.verbose, argv['scripts-version']);

function createApp(name, verbose, version) {
  var root = path.resolve(name);
  var appName = path.basename(root);

  checkAppName(appName);

  if (!pathExists.sync(name)) {
    fs.mkdirSync(root);
  } else if (!isSafeToCreateProjectIn(root)) {
    console.log('The directory `' + name + '` contains file(s) that could conflict. Aborting.');
    process.exit(1);
  }

  console.log(
    'Creating a new React app in ' + root + '.'
  );
  console.log();

  var packageJson = {
    name: appName,
    version: '0.1.0',
    private: true,
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  var originalDirectory = process.cwd();
  process.chdir(root);

  console.log('Installing packages. This might take a couple minutes.');
  console.log('Installing react-scripts...');
  console.log();

  run(root, appName, version, verbose, originalDirectory);
}

function install(packageToInstall, verbose, callback) {
  function fallbackToNpm() {
    var npmArgs = [
      'install',
      verbose && '--verbose',
      '--save-dev',
      '--save-exact',
      packageToInstall,
    ].filter(function(e) { return e; });
    var npmProc = spawn('npm', npmArgs, {stdio: 'inherit'});
    npmProc.on('close', function (code) {
      callback(code, 'npm', npmArgs);
    });
  }

  var yarnArgs = [
    'add',
    '--dev',
    '--exact',
    packageToInstall,
  ];
  var yarnProc;
  var yarnExists = true;
  try {
    yarnProc = spawn('yarn', yarnArgs, {stdio: 'inherit'});
  } catch (err) {
    // It's not clear why we end up here in some cases but we need this.
    // https://github.com/facebookincubator/create-react-app/issues/1200
    yarnExists = false;
    fallbackToNpm();
    return;
  }
  yarnProc.on('error', function (err) {
    if (err.code === 'ENOENT') {
      yarnExists = false;
    }
  });
  yarnProc.on('close', function (code) {
    if (yarnExists) {
      callback(code, 'yarn', yarnArgs);
    } else {
      fallbackToNpm();
    }
  });
}

function run(root, appName, version, verbose, originalDirectory) {
  var packageToInstall = getInstallPackage(version);
  var packageName = getPackageName(packageToInstall);

  install(packageToInstall, verbose, function (code, command, args) {
    if (code !== 0) {
      console.error('`' + command + ' ' + args.join(' ') + '` failed');
      return;
    }

    checkNodeVersion(packageName);

    var scriptsPath = path.resolve(
      process.cwd(),
      'node_modules',
      packageName,
      'scripts',
      'init.js'
    );
    var init = require(scriptsPath);
    init(root, appName, verbose, originalDirectory);
  });
}

function getInstallPackage(version) {
  var packageToInstall = 'react-scripts';
  var validSemver = semver.valid(version);
  if (validSemver) {
    packageToInstall += '@' + validSemver;
  } else if (version) {
    // for tar.gz or alternative paths
    packageToInstall = version;
  }
  return packageToInstall;
}

// Extract package name from tarball url or path.
function getPackageName(installPackage) {
  if (installPackage.indexOf('.tgz') > -1) {
    // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
    // However, this function returns package name only wihout semver version.
    return installPackage.match(/^.+\/(.+?)(?:-\d+.+)?\.tgz$/)[1];
  } else if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return installPackage.charAt(0) + installPackage.substr(1).split('@')[0];
  }
  return installPackage;
}

function checkNodeVersion(packageName) {
  var packageJsonPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName,
    'package.json'
  );
  var packageJson = require(packageJsonPath);
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }

  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(
      chalk.red(
        'You are currently running Node %s but create-react-app requires %s.' +
        ' Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkAppName(appName) {
  // TODO: there should be a single place that holds the dependencies
  var dependencies = ['react', 'react-dom'];
  var devDependencies = ['react-scripts'];
  var allDependencies = dependencies.concat(devDependencies).sort();

  if (allDependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        'We cannot create a project called `' + appName + '` because a dependency with the same name exists.\n' +
        'Due to the way npm works, the following names are not allowed:\n\n'
      ) +
      chalk.cyan(
        allDependencies.map(function(depName) {
          return '  ' + depName;
        }).join('\n')
      ) +
      chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root) {
  var validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE'
  ];
  return fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    });
}
