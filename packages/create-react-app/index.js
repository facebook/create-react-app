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

var chalk = require('chalk');
var validateProjectName = require("validate-npm-package-name");

var currentNodeVersion = process.versions.node;
if (currentNodeVersion.split('.')[0] < 4) {
  console.error(
    chalk.red(
      'You are running Node ' + currentNodeVersion + '.\n' +
      'Create React App requires Node 4 or higher. \n' +
      'Please update your version of Node.'
    )
  );
  process.exit(1);
}

var commander = require('commander');
var fs = require('fs-extra');
var path = require('path');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var semver = require('semver');
var dns = require('dns');
var tmp = require('tmp');
var unpack = require('tar-pack').unpack;
var hyperquest = require('hyperquest');

var projectName;

var program = commander
  .version(require('./package.json').version)
  .arguments('<project-directory>')
  .usage(chalk.green('<project-directory>') + ' [options]')
  .action(function (name) {
    projectName = name;
  })
  .option('--verbose', 'print additional logs')
  .option('--scripts-version <alternative-package>', 'use a non-standard version of react-scripts')
  .allowUnknownOption()
  .on('--help', function () {
    console.log('    Only ' + chalk.green('<project-directory>') + ' is required.');
    console.log();
    console.log('    A custom ' + chalk.cyan('--scripts-version') + ' can be one of:');
    console.log('      - a specific npm version: ' + chalk.green('0.8.2'));
    console.log('      - a custom fork published on npm: ' + chalk.green('my-react-scripts'));
    console.log('      - a .tgz archive: ' + chalk.green('https://mysite.com/my-react-scripts-0.8.2.tgz'));
    console.log('    It is not needed unless you specifically want to use a fork.');
    console.log();
    console.log('    If you have any problems, do not hesitate to file an issue:');
    console.log('      ' + chalk.cyan('https://github.com/facebookincubator/create-react-app/issues/new'));
    console.log();
  })
  .parse(process.argv);

if (typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log('  ' + chalk.cyan(program.name()) + chalk.green(' <project-directory>'));
  console.log();
  console.log('For example:');
  console.log('  ' + chalk.cyan(program.name()) + chalk.green(' my-react-app'));
  console.log();
  console.log('Run ' + chalk.cyan(program.name() + ' --help') + ' to see all options.');
  process.exit(1);
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(function (error) {
      console.error(chalk.red('  * ' + error));
    });
  }
}

var hiddenProgram = new commander.Command()
  .option('--internal-testing-template <path-to-template>', '(internal usage only, DO NOT RELY ON THIS) ' +
    'use a non-standard application template')
  .parse(process.argv)

createApp(projectName, program.verbose, program.scriptsVersion, hiddenProgram.internalTestingTemplate);

function createApp(name, verbose, version, template) {
  var root = path.resolve(name);
  var appName = path.basename(root);

  checkAppName(appName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root)) {
    console.log('The directory ' + chalk.green(name) + ' contains files that could conflict.');
    console.log('Try using a new directory name.');
    process.exit(1);
  }

  console.log(
    'Creating a new React app in ' + chalk.green(root) + '.'
  );
  console.log();

  var packageJson = {
    name: appName,
    version: '0.1.0',
    private: true
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  var originalDirectory = process.cwd();
  process.chdir(root);

  run(root, appName, version, verbose, originalDirectory, template);
}

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', {stdio: 'ignore'});
    return true;
  } catch (e) {
    return false;
  }
}

function install(useYarn, dependencies, verbose, isOnline) {
  return new Promise(function(resolve, reject) {
    var command;
    var args;
    if (useYarn) {
      command = 'yarnpkg';
      args = [
        'add',
        '--exact',
      ];
      if (!isOnline) {
        args.push('--offline');
      }
      [].push.apply(args, dependencies);

      if (!isOnline) {
        console.log(chalk.yellow('You appear to be offline.'));
        console.log(chalk.yellow('Falling back to the local Yarn cache.'));
        console.log();
      }

    } else {
      checkNpmVersion();
      command = 'npm';
      args = ['install', '--save', '--save-exact'].concat(dependencies);
    }

    if (verbose) {
      args.push('--verbose');
    }

    var child = spawn(command, args, {stdio: 'inherit'});
    child.on('close', function(code) {
      if (code !== 0) {
        reject({
          command: command + ' ' + args.join(' ')
        });
        return;
      }
      resolve();
    });
  });
}

function run(root, appName, version, verbose, originalDirectory, template) {
  var packageToInstall = getInstallPackage(version);
  var allDependencies = ['react', 'react-dom', packageToInstall];

  console.log('Installing packages. This might take a couple minutes.');

  var useYarn = shouldUseYarn();
  getPackageName(packageToInstall)
    .then(function(packageName) {
      return checkIfOnline(useYarn).then(function(isOnline) {
        return {
          isOnline: isOnline,
          packageName: packageName,
        };
      });
    })
    .then(function(info) {
      var isOnline = info.isOnline;
      var packageName = info.packageName;
      console.log(
        'Installing ' + chalk.cyan('react') + ', ' + chalk.cyan('react-dom') +
        ', and ' + chalk.cyan(packageName) + '...'
      );
      console.log();

      return install(useYarn, allDependencies, verbose, isOnline).then(function() {
        return packageName;
      });
    })
    .then(function(packageName) {
      checkNodeVersion(packageName);

      // Since react-scripts has been installed with --save
      // we need to move it into devDependencies and rewrite package.json
      // also ensure react dependencies have caret version range
      fixDependencies(packageName);

      var scriptsPath = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        'scripts',
        'init.js'
      );
      var init = require(scriptsPath);
      init(root, appName, verbose, originalDirectory, template);
    })
    .catch(function(reason) {
      console.log();
      console.log('Aborting installation.');
      if (reason.command) {
        console.log('  ' + chalk.cyan(reason.command), 'has failed.')
      } else {
        console.log(chalk.red('Unexpected error. Please report it as a bug:'));
        console.log(reason);
      }
      console.log();

      // On 'exit' we will delete these files from target directory.
      var knownGeneratedFiles = [
        'package.json', 'npm-debug.log', 'yarn-error.log', 'yarn-debug.log', 'node_modules'
      ];
      var currentFiles = fs.readdirSync(path.join(root));
      currentFiles.forEach(function (file) {
        knownGeneratedFiles.forEach(function (fileToMatch) {
          // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
          // and the rest of knownGeneratedFiles.
          if ((fileToMatch.match(/.log/g) && file.indexOf(fileToMatch) === 0) || file === fileToMatch) {
            console.log('Deleting generated file...', chalk.cyan(file));
            fs.removeSync(path.join(root, file));
          }
        });
      });
      var remainingFiles = fs.readdirSync(path.join(root));
      if (!remainingFiles.length) {
        // Delete target folder if empty
        console.log('Deleting', chalk.cyan(appName + '/'), 'from', chalk.cyan(path.resolve(root, '..')));
        process.chdir(path.resolve(root, '..'));
        fs.removeSync(path.join(root));
      }
      console.log('Done.');
      process.exit(1);
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

function getTemporaryDirectory() {
  return new Promise(function(resolve, reject) {
    // Unsafe cleanup lets us recursively delete the directory if it contains
    // contents; by default it only allows removal if it's empty
    tmp.dir({ unsafeCleanup: true }, function(err, tmpdir, callback) {
      if (err) {
        reject(err);
      } else {
        resolve({
          tmpdir: tmpdir,
          cleanup: function() {
            try {
              callback();
            } catch (ignored) {
              // Callback might throw and fail, since it's a temp directory the
              // OS will clean it up eventually...
            }
          }
        });
      }
    });
  });
}

function extractStream(stream, dest) {
  return new Promise(function(resolve, reject) {
    stream.pipe(unpack(dest, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(dest);
      }
    }));
  });
}

// Extract package name from tarball url or path.
function getPackageName(installPackage) {
  if (installPackage.indexOf('.tgz') > -1) {
    return getTemporaryDirectory().then(function(obj) {
      var stream;
      if (/^http/.test(installPackage)) {
        stream = hyperquest(installPackage);
      } else {
        stream = fs.createReadStream(installPackage);
      }
      return extractStream(stream, obj.tmpdir).then(function() {
        return obj;
      });
    }).then(function(obj) {
      var packageName = require(path.join(obj.tmpdir, 'package.json')).name;
      obj.cleanup();
      return packageName;
    }).catch(function(err) {
      // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
      // However, this function returns package name only without semver version.
      console.log('Could not extract the package name from the archive: ' + err.message);
      var assumedProjectName = installPackage.match(/^.+\/(.+?)(?:-\d+.+)?\.tgz$/)[1];
      console.log('Based on the filename, assuming it is "' + chalk.cyan(assumedProjectName) + '"');
      return Promise.resolve(assumedProjectName);
    });
  } else if (installPackage.indexOf('git+') === 0) {
    // Pull package name out of git urls e.g:
    // git+https://github.com/mycompany/react-scripts.git
    // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
    return Promise.resolve(installPackage.match(/([^\/]+)\.git(#.*)?$/)[1]);
  } else if (installPackage.indexOf('@') > 0) {
    // Do not match @scope/ when stripping off @version or @tag
    return Promise.resolve(installPackage.charAt(0) + installPackage.substr(1).split('@')[0]);
  }
  return Promise.resolve(installPackage);
}

function checkNpmVersion() {
  var isNpm2 = false;
  try {
    var npmVersion = execSync('npm --version').toString();
    isNpm2 = semver.lt(npmVersion, '3.0.0');
  } catch (err) {
    return;
  }
  if (!isNpm2) {
    return;
  }
  console.log(chalk.yellow('It looks like you are using npm 2.'));
  console.log(chalk.yellow(
    'We suggest using npm 3 or Yarn for faster install times ' +
    'and less disk space usage.'
  ));
  console.log();
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
        'You are running Node %s.\n' +
        'Create React App requires Node %s or higher. \n' +
        'Please update your version of Node.'
      ),
      process.version,
      packageJson.engines.node
    );
    process.exit(1);
  }
}

function checkAppName(appName) {
  var validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error('Could not create a project called ' + chalk.red('"' + appName + '"') + ' because of npm naming restrictions:');
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  var dependencies = ['react', 'react-dom'];
  var devDependencies = ['react-scripts'];
  var allDependencies = dependencies.concat(devDependencies).sort();
  if (allDependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        'We cannot create a project called ' + chalk.green(appName) + ' because a dependency with the same name exists.\n' +
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

function makeCaretRange(dependencies, name) {
  var version = dependencies[name];

  if (typeof version === 'undefined') {
    console.error(
      chalk.red('Missing ' + name + ' dependency in package.json')
    );
    process.exit(1);
  }

  var patchedVersion = '^' + version;

  if (!semver.validRange(patchedVersion)) {
    console.error(
      'Unable to patch ' + name + ' dependency version because version ' + chalk.red(version) + ' will become invalid ' + chalk.red(patchedVersion)
    );
    patchedVersion = version;
  }

  dependencies[name] = patchedVersion;
}

function fixDependencies(packageName) {
  var packagePath = path.join(process.cwd(), 'package.json');
  var packageJson = require(packagePath);

  if (typeof packageJson.dependencies === 'undefined') {
    console.error(
      chalk.red('Missing dependencies in package.json')
    );
    process.exit(1);
  }

  var packageVersion = packageJson.dependencies[packageName];

  if (typeof packageVersion === 'undefined') {
    console.error(
      chalk.red('Unable to find ' + packageName + ' in package.json')
    );
    process.exit(1);
  }

  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies[packageName] = packageVersion;
  delete packageJson.dependencies[packageName];

  makeCaretRange(packageJson.dependencies, 'react');
  makeCaretRange(packageJson.dependencies, 'react-dom');

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

// If project only contains files generated by GH, it’s safe.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebookincubator/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root) {
  var validFiles = [
    '.DS_Store', 'Thumbs.db', '.git', '.gitignore', '.idea', 'README.md', 'LICENSE', 'web.iml'
  ];
  return fs.readdirSync(root)
    .every(function(file) {
      return validFiles.indexOf(file) >= 0;
    });
}

function checkIfOnline(useYarn) {
  if (!useYarn) {
    // Don't ping the Yarn registry.
    // We'll just assume the best case.
    return Promise.resolve(true);
  }

  return new Promise(function(resolve) {
    dns.resolve('registry.yarnpkg.com', function(err) {
      resolve(err === null);
    });
  });
}
