// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const paths = require('../config/paths');
const createJestConfig = require('./utils/createJestConfig');
const inquirer = require('react-dev-utils/inquirer');
const spawnSync = require('react-dev-utils/crossSpawn').sync;

const green = chalk.green;
const cyan = chalk.cyan;

function getGitStatus() {
  try {
    let stdout = execSync(`git status --porcelain`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString();
    return stdout.trim();
  } catch (e) {
    return '';
  }
}

const ADD_PACKAGE = true,
  REMOVE_PACKAGE = false;
const PROD_PACKAGE = true,
  DEV_PACKAGE = false;
function adjustPackages(cwd, packages, append, dev) {
  if (!Array.isArray(packages)) {
    packages = [packages];
  }
  let status, output;
  if (fs.existsSync(paths.yarnLockFile)) {
    ({ status, output } = spawnSync(
      process.platform === 'win32' ? 'yarnpkg.cmd' : 'yarnpkg',
      [append ? 'add' : 'remove', ...packages],
      {
        stdio: 'pipe',
        cwd,
      }
    ));
  } else {
    ({ status, output } = spawnSync(
      'npm',
      [
        append ? 'install' : 'uninstall',
        dev ? '-D' : '-S',
        '--loglevel',
        'error',
        ...packages,
      ],
      {
        stdio: 'pipe',
        cwd,
      }
    ));
  }

  if (status !== 0) {
    console.error(chalk.red('Failed to update the dependencies.'));
    console.error();
    console.error(output.join(process.platform === 'win32' ? '\r\n' : '\n'));
    process.exit(status);
  }
}

inquirer
  .prompt({
    type: 'confirm',
    name: 'shouldEject',
    message: 'Are you sure you want to eject? This action is permanent.',
    default: false,
  })
  .then(answer => {
    if (!answer.shouldEject) {
      console.log(cyan('Close one! Eject aborted.'));
      return;
    }

    const gitStatus = getGitStatus();
    if (gitStatus) {
      console.error(
        chalk.red(
          'This git repository has untracked files or uncommitted changes:'
        ) +
          '\n\n' +
          gitStatus
            .split('\n')
            .map(line => line.match(/ .*/g)[0].trim())
            .join('\n') +
          '\n\n' +
          chalk.red(
            'Remove untracked files, stash or commit any changes, and try again.'
          )
      );
      process.exit(1);
    }

    console.log('Ejecting...');

    const ownPath = paths.ownPath;
    const appPath = paths.appPath;

    function verifyAbsent(file) {
      if (fs.existsSync(path.join(appPath, file))) {
        console.error(
          `\`${file}\` already exists in your app folder. We cannot ` +
            'continue as you would lose all the changes in that file or directory. ' +
            'Please move or delete it (maybe make a copy for backup) and run this ' +
            'command again.'
        );
        process.exit(1);
      }
    }

    const folders = ['config', 'config/jest', 'scripts'];

    // Make shallow array of files paths
    const files = folders.reduce((files, folder) => {
      return files.concat(
        fs
          .readdirSync(path.join(ownPath, folder))
          // set full path
          .map(file => path.join(ownPath, folder, file))
          // omit dirs from file list
          .filter(file => fs.lstatSync(file).isFile())
      );
    }, []);

    // Ensure that the app folder is clean and we won't override any files
    folders.forEach(verifyAbsent);
    files.forEach(verifyAbsent);

    // Prepare Jest config early in case it throws
    const jestConfig = createJestConfig(
      filePath => path.posix.join('<rootDir>', filePath),
      null,
      true
    );

    console.log();
    console.log(cyan(`Copying files into ${appPath}`));

    folders.forEach(folder => {
      fs.mkdirSync(path.join(appPath, folder));
    });

    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');

      // Skip flagged files
      if (content.match(/\/\/ @remove-file-on-eject/)) {
        return;
      }
      content =
        content
          // Remove dead code from .js files on eject
          .replace(
            /\/\/ @remove-on-eject-begin([\s\S]*?)\/\/ @remove-on-eject-end/gm,
            ''
          )
          // Remove dead code from .applescript files on eject
          .replace(
            /-- @remove-on-eject-begin([\s\S]*?)-- @remove-on-eject-end/gm,
            ''
          )
          .trim() + '\n';
      console.log(`  Adding ${cyan(file.replace(ownPath, ''))} to the project`);
      fs.writeFileSync(file.replace(ownPath, appPath), content);
    });
    console.log();

    const ownPackage = require(path.join(ownPath, 'package.json'));
    const ejectingAppPackage = require(path.join(appPath, 'package.json'));

    console.log(cyan('Updating the dependencies'));
    const ownPackageName = ownPackage.name;
    if (ejectingAppPackage.devDependencies) {
      // We used to put react-scripts in devDependencies
      if (ejectingAppPackage.devDependencies[ownPackageName]) {
        console.log(`  Removing ${cyan(ownPackageName)} from devDependencies`);
        adjustPackages(appPath, ownPackageName, REMOVE_PACKAGE, DEV_PACKAGE);
      }
    }
    ejectingAppPackage.dependencies = ejectingAppPackage.dependencies || {};
    if (ejectingAppPackage.dependencies[ownPackageName]) {
      console.log(`  Removing ${cyan(ownPackageName)} from dependencies`);
      adjustPackages(appPath, ownPackageName, REMOVE_PACKAGE, PROD_PACKAGE);
    }
    let appendList = [];
    Object.keys(ownPackage.dependencies).forEach(key => {
      // For some reason optionalDependencies end up in dependencies after install
      if (ownPackage.optionalDependencies[key]) {
        return;
      }
      console.log(`  Adding ${cyan(key)} to dependencies`);
      appendList.push(`${key}@${ownPackage.dependencies[key]}`);
    });
    adjustPackages(appPath, appendList, ADD_PACKAGE, PROD_PACKAGE);
    console.log();

    const ejectedAppPackage = require(path.join(appPath, 'package.json'));
    console.log(cyan('Updating the scripts'));
    delete ejectedAppPackage.scripts['eject'];
    Object.keys(ejectedAppPackage.scripts).forEach(key => {
      Object.keys(ownPackage.bin).forEach(binKey => {
        const regex = new RegExp(binKey + ' (\\w+)', 'g');
        if (!regex.test(ejectedAppPackage.scripts[key])) {
          return;
        }
        ejectedAppPackage.scripts[key] = ejectedAppPackage.scripts[key].replace(
          regex,
          'node scripts/$1.js'
        );
        console.log(
          `  Replacing ${cyan(`"${binKey} ${key}"`)} with ${cyan(
            `"node scripts/${key}.js"`
          )}`
        );
      });
    });

    console.log();
    console.log(cyan('Configuring package.json'));
    // Add Jest config
    console.log(`  Adding ${cyan('Jest')} configuration`);
    ejectedAppPackage.jest = jestConfig;

    // Add Babel config
    console.log(`  Adding ${cyan('Babel')} preset`);
    ejectedAppPackage.babel = {
      presets: ['react-app'],
    };

    // Add ESlint config
    console.log(`  Adding ${cyan('ESLint')} configuration`);
    ejectedAppPackage.eslintConfig = {
      extends: 'react-app',
    };

    fs.writeFileSync(
      path.join(appPath, 'package.json'),
      JSON.stringify(ejectedAppPackage, null, 2) + '\n'
    );
    console.log();

    // "Don't destroy what isn't ours"
    if (ownPath.indexOf(appPath) === 0) {
      try {
        // remove react-scripts and react-scripts binaries from app node_modules
        Object.keys(ownPackage.bin).forEach(binKey => {
          fs.removeSync(path.join(appPath, 'node_modules', '.bin', binKey));
        });
        fs.removeSync(ownPath);
      } catch (e) {
        // It's not essential that this succeeds
      }
    }

    console.log(green('Ejected successfully!'));
    console.log();

    console.log(
      green('Please consider sharing why you ejected in this survey:')
    );
    console.log(green('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1'));
    console.log();
  });
