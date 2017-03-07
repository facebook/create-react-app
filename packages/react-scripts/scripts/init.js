// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var spawn = require('cross-spawn');
var chalk = require('chalk');

module.exports = function(appPath, appName, verbose, originalDirectory, template) {
  var ownPackageName = require(path.join(__dirname, '..', 'package.json')).name;
  var ownPath = path.join(appPath, 'node_modules', ownPackageName);
  var appPackage = require(path.join(appPath, 'package.json'));
  var useYarn = fs.existsSync(path.join(appPath, 'yarn.lock'));

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  // Setup the script rules
  appPackage.scripts = {
    'start': 'react-scripts start',
    'build': 'react-scripts build',
    'test': 'react-scripts test --env=jsdom',
    'eject': 'react-scripts eject'
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  var readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(path.join(appPath, 'README.md'), path.join(appPath, 'README.old.md'));
  }

  // Copy the files for the user
  var templatePath = template ? path.resolve(originalDirectory, template) : path.join(ownPath, 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error('Could not locate supplied template: ' + chalk.green(templatePath));
    return;
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  fs.move(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'), [], function (err) {
    if (err) {
      // Append if there's already a `.gitignore` file there
      if (err.code === 'EEXIST') {
        var data = fs.readFileSync(path.join(appPath, 'gitignore'));
        fs.appendFileSync(path.join(appPath, '.gitignore'), data);
        fs.unlinkSync(path.join(appPath, 'gitignore'));
      } else {
        throw err;
      }
    }
  });

  var command;
  var args;

  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
  } else {
    command = 'npm';
    args = [
      'install',
      '--save',
      verbose && '--verbose'
    ].filter(function(e) { return e; });
  }
  args.push('react', 'react-dom');

  // Install additional template dependencies, if present
  var templateDependenciesPath = path.join(appPath, '.template.dependencies.json');
  if (fs.existsSync(templateDependenciesPath)) {
    var templateDependencies = require(templateDependenciesPath).dependencies;
    args = args.concat(Object.keys(templateDependencies).map(function (key) {
      return key + '@' + templateDependencies[key];
    }));
    fs.unlinkSync(templateDependenciesPath);
  }

  // Install react and react-dom for backward compatibility with old CRA cli
  // which doesn't install react and react-dom along with react-scripts
  // or template is presetend (via --internal-testing-template)
  if (!isReactInstalled(appPackage) || template) {
    console.log('Installing react and react-dom using ' + command + '...');
    console.log();

    var proc = spawn.sync(command, args, {stdio: 'inherit'});
    if (proc.status !== 0) {
      console.error('`' + command + ' ' + args.join(' ') + '` failed');
      return;
    }
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  var cdpath;
  if (originalDirectory &&
      path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  // Change displayed command to yarn instead of yarnpkg
  var displayedCommand = useYarn ? 'yarn' : 'npm';

  console.log();
  console.log('Success! Created ' + appName + ' at ' + appPath);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan('  ' + displayedCommand + ' start'));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan('  ' + displayedCommand + ' run build'));
  console.log('    Bundles the app into static files for production.');
  console.log();
  console.log(chalk.cyan('  ' + displayedCommand + ' test'));
  console.log('    Starts the test runner.');
  console.log();
  console.log(chalk.cyan('  ' + displayedCommand + ' run eject'));
  console.log('    Removes this tool and copies build dependencies, configuration files');
  console.log('    and scripts into the app directory. If you do this, you can’t go back!');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log('  ' + chalk.cyan(displayedCommand + ' start'));
  if (readmeExists) {
    console.log();
    console.log(chalk.yellow('You had a `README.md` file, we renamed it to `README.old.md`'));
  }
  console.log();
  console.log('Happy hacking!');
};

function isReactInstalled(appPackage) {
  var dependencies = appPackage.dependencies || {};

  return (
    typeof dependencies.react !== 'undefined' &&
    typeof dependencies['react-dom'] !== 'undefined'
  )
}
