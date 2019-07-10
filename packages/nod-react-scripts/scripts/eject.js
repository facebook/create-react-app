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
const chalk = require('react-dev-utils/chalk');
const paths = require('../config/paths');
const createJestConfig = require('./utils/createJestConfig');
const inquirer = require('react-dev-utils/inquirer');
const spawnSync = require('react-dev-utils/crossSpawn').sync;
const os = require('os');

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

function tryGitAdd(appPath) {
  try {
    spawnSync(
      'git',
      ['add', path.join(appPath, 'config'), path.join(appPath, 'scripts')],
      {
        stdio: 'inherit',
      }
    );

    return true;
  } catch (e) {
    return false;
  }
}

console.log(
  chalk.cyan.bold(
    'NOTE: Create React App 2+ supports TypeScript, Sass, CSS Modules and more without ejecting: ' +
      'https://reactjs.org/blog/2018/10/01/create-react-app-v2.html'
  )
);
console.log();

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
    const appPackage = require(path.join(appPath, 'package.json'));

    console.log(cyan('Updating the dependencies'));
    const ownPackageName = ownPackage.name;
    if (appPackage.devDependencies) {
      // We used to put react-scripts in devDependencies
      if (appPackage.devDependencies[ownPackageName]) {
        console.log(`  Removing ${cyan(ownPackageName)} from devDependencies`);
        delete appPackage.devDependencies[ownPackageName];
      }
    }
    appPackage.dependencies = appPackage.dependencies || {};
    if (appPackage.dependencies[ownPackageName]) {
      console.log(`  Removing ${cyan(ownPackageName)} from dependencies`);
      delete appPackage.dependencies[ownPackageName];
    }
    Object.keys(ownPackage.dependencies).forEach(key => {
      // For some reason optionalDependencies end up in dependencies after install
      if (
        ownPackage.optionalDependencies &&
        ownPackage.optionalDependencies[key]
      ) {
        return;
      }
      console.log(`  Adding ${cyan(key)} to dependencies`);
      appPackage.dependencies[key] = ownPackage.dependencies[key];
    });
    // Sort the deps
    const unsortedDependencies = appPackage.dependencies;
    appPackage.dependencies = {};
    Object.keys(unsortedDependencies)
      .sort()
      .forEach(key => {
        appPackage.dependencies[key] = unsortedDependencies[key];
      });
    console.log();

    console.log(cyan('Updating the scripts'));
    delete appPackage.scripts['eject'];
    Object.keys(appPackage.scripts).forEach(key => {
      Object.keys(ownPackage.bin).forEach(binKey => {
        const regex = new RegExp(binKey + ' (\\w+)', 'g');
        if (!regex.test(appPackage.scripts[key])) {
          return;
        }
        appPackage.scripts[key] = appPackage.scripts[key].replace(
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
    appPackage.jest = jestConfig;

    // Add Babel config
    console.log(`  Adding ${cyan('Babel')} preset`);
    appPackage.babel = {
      presets: ['react-app'],
    };

    // Add ESlint config
    console.log(`  Adding ${cyan('ESLint')} configuration`);
    appPackage.eslintConfig = {
      extends: 'react-app',
    };

    fs.writeFileSync(
      path.join(appPath, 'package.json'),
      JSON.stringify(appPackage, null, 2) + os.EOL
    );
    console.log();

    if (fs.existsSync(paths.appTypeDeclarations)) {
      try {
        // Read app declarations file
        let content = fs.readFileSync(paths.appTypeDeclarations, 'utf8');
        const ownContent =
          fs.readFileSync(paths.ownTypeDeclarations, 'utf8').trim() + os.EOL;

        // Remove react-scripts reference since they're getting a copy of the types in their project
        content =
          content
            // Remove react-scripts types
            .replace(
              /^\s*\/\/\/\s*<reference\s+types.+?"react-scripts".*\/>.*(?:\n|$)/gm,
              ''
            )
            .trim() + os.EOL;

        fs.writeFileSync(
          paths.appTypeDeclarations,
          (ownContent + os.EOL + content).trim() + os.EOL
        );
      } catch (e) {
        // It's not essential that this succeeds, the TypeScript user should
        // be able to re-create these types with ease.
      }
    }

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

    if (fs.existsSync(paths.yarnLockFile)) {
      const windowsCmdFilePath = path.join(
        appPath,
        'node_modules',
        '.bin',
        'react-scripts.cmd'
      );
      let windowsCmdFileContent;
      if (process.platform === 'win32') {
        // https://github.com/facebook/create-react-app/pull/3806#issuecomment-357781035
        // Yarn is diligent about cleaning up after itself, but this causes the react-scripts.cmd file
        // to be deleted while it is running. This trips Windows up after the eject completes.
        // We'll read the batch file and later "write it back" to match npm behavior.
        try {
          windowsCmdFileContent = fs.readFileSync(windowsCmdFilePath);
        } catch (err) {
          // If this fails we're not worse off than if we didn't try to fix it.
        }
      }

      console.log(cyan('Running yarn...'));
      spawnSync('yarnpkg', ['--cwd', process.cwd()], { stdio: 'inherit' });

      if (windowsCmdFileContent && !fs.existsSync(windowsCmdFilePath)) {
        try {
          fs.writeFileSync(windowsCmdFilePath, windowsCmdFileContent);
        } catch (err) {
          // If this fails we're not worse off than if we didn't try to fix it.
        }
      }
    } else {
      console.log(cyan('Running npm install...'));
      spawnSync('npm', ['install', '--loglevel', 'error'], {
        stdio: 'inherit',
      });
    }
    console.log(green('Ejected successfully!'));
    console.log();

    if (tryGitAdd(appPath)) {
      console.log(cyan('Staged ejected files for commit.'));
      console.log();
    }

    console.log(
      green('Please consider sharing why you ejected in this survey:')
    );
    console.log(green('  http://goo.gl/forms/Bi6CZjk1EqsdelXk1'));
    console.log();
  });
