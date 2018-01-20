#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc. 
 * 
 * This source code is licensed under the MIT license found in the 
 * LICENSE file in the root directory of this source tree. 
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const cleanup = () => {
  console.log('Cleaning up.');
  // Reset changes made to package.json files.
  cp.execSync(`git checkout -- packages/*/package.json`);
  // Uncomment when snapshot testing is enabled by default:
  // rm ./template/src/__snapshots__/App.test.js.snap
};

const handleExit = () => {
  cleanup();
  console.log('Exiting without error.');
  process.exit();
};

const handleError = e => {
  console.error('ERROR! An error was encountered while executing');
  console.error(e);
  cleanup();
  console.log('Exiting with error.');
  process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

console.log();
console.log('-------------------------------------------------------');
console.log('Assuming you have already run `yarn` to update the deps.');
console.log('If not, remember to do this before testing!');
console.log('-------------------------------------------------------');
console.log();

// Temporarily overwrite package.json of all packages in monorepo
// to point to each other using absolute file:/ URLs.

const gitStatus = cp.execSync(`git status --porcelain`).toString();

if (gitStatus.trim() !== '') {
  console.log('Please commit your changes before running this script!');
  console.log('Exiting because `git status` is not empty:');
  console.log();
  console.log(gitStatus);
  console.log();
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const packagePathsByName = {};
fs.readdirSync(packagesDir).forEach(name => {
  const packageDir = path.join(packagesDir, name);
  const packageJson = path.join(packageDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    packagePathsByName[name] = packageDir;
  }
});
Object.keys(packagePathsByName).forEach(name => {
  const packageJson = path.join(packagePathsByName[name], 'package.json');
  const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  Object.keys(packagePathsByName).forEach(otherName => {
    if (json.dependencies && json.dependencies[otherName]) {
      json.dependencies[otherName] = 'file:' + packagePathsByName[otherName];
    }
    if (json.devDependencies && json.devDependencies[otherName]) {
      json.devDependencies[otherName] = 'file:' + packagePathsByName[otherName];
    }
    if (json.peerDependencies && json.peerDependencies[otherName]) {
      json.peerDependencies[otherName] =
        'file:' + packagePathsByName[otherName];
    }
    if (json.optionalDependencies && json.optionalDependencies[otherName]) {
      json.optionalDependencies[otherName] =
        'file:' + packagePathsByName[otherName];
    }
  });

  fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  console.log(
    'Replaced local dependencies in packages/' + name + '/package.json'
  );
});
console.log('Replaced all local dependencies for testing.');
console.log('Do not edit any package.json while this task is running.');

// Finally, pack react-scripts.
// Don't redirect stdio as we want to capture the output that will be returned
// from execSync(). In this case it will be the .tgz filename.
const scriptsFileName = cp
  .execSync(`npm pack`, { cwd: path.join(packagesDir, 'react-scripts') })
  .toString()
  .trim();
const scriptsPath = path.join(packagesDir, 'react-scripts', scriptsFileName);

// Now that we have packed them, call the global CLI.
cp.execSync('yarn cache clean');

const args = process.argv.slice(2);

// Now run the CRA command
const craScriptPath = path.join(packagesDir, 'create-react-app', 'index.js');
cp.execSync(
  `node ${craScriptPath} --scripts-version="${scriptsPath}" ${args.join(' ')}`,
  {
    cwd: rootDir,
    stdio: 'inherit',
  }
);

// Cleanup
handleExit();
