// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

// We assume that having wrong versions of these
// in the tree will likely break your setup.
// This is a relatively low-effort way to find common issues.
function verifyPackageTreeFrontier() {
  const depsToCheck = [
    // These are packages most likely to break in practice.
    // See https://github.com/facebook/create-react-app/issues/1795 for reasons why.
    // I have not included Babel here because plugins typically don't import Babel (so it's not affected).
    'babel-eslint',
    // 'babel-jest',
    'babel-loader',
    // 'eslint',
    // 'jest',
    'webpack',
    'webpack-dev-server',
  ];
  // Inlined from semver-regex, MIT license.
  // Don't want to make this a dependency after ejecting.
  const getSemverRegex = () =>
    /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi;
  const ownPackageJson = require('../../package.json');
  const expectedVersionsByDep = {};
  // Gather wanted deps
  depsToCheck.forEach(dep => {
    const expectedVersion = ownPackageJson.dependencies[dep];
    if (!expectedVersion) {
      throw new Error('This dependency list is outdated, fix it.');
    }
    if (!getSemverRegex().test(expectedVersion)) {
      throw new Error(
        `The ${dep} package should be pinned, instead got version ${expectedVersion}.`
      );
    }
    expectedVersionsByDep[dep] = expectedVersion;
  });
  // Verify we don't have other versions up the tree
  let currentDir = __dirname;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const previousDir = currentDir;
    currentDir = path.resolve(currentDir, '..');
    if (currentDir === previousDir) {
      // We've reached the root.
      break;
    }
    const maybeNodeModules = path.resolve(currentDir, 'node_modules');
    if (!fs.existsSync(maybeNodeModules)) {
      continue;
    }
    depsToCheck.forEach(dep => {
      const maybeDep = path.resolve(maybeNodeModules, dep);
      if (!fs.existsSync(maybeDep)) {
        return;
      }
      const maybeDepPackageJson = path.resolve(maybeDep, 'package.json');
      if (!fs.existsSync(maybeDepPackageJson)) {
        return;
      }
      // console.log('\n\n\n')
      // console.log('maybeNodeModules: ', maybeNodeModules)
      // console.log('maybeDep: ', maybeDep)
      const depPackageJson = JSON.parse(fs.readFileSync(maybeDepPackageJson, 'utf8'));
      const expectedVersion = expectedVersionsByDep[dep];
      // console.log('JSON.stringify(depPackageJson, null, 2): ', JSON.stringify(depPackageJson, null, 2))
      // console.log('depPackageJson.version: ', depPackageJson.version)
      // console.log('expectedVersion: ', expectedVersion)
      // console.log('semver.coerce(expectedVersion): ', semver.coerce(expectedVersion))
      if (semver.diff(depPackageJson.version, semver.coerce(expectedVersion)) === 'major') {
        console.error(
          `The ${chalk.bold(
            ownPackageJson.name
          )} package provided by Frontier's Fork of Create React App requires a major dependency:\n\n` +
            chalk.green(`  "${chalk.bold(dep)}": "${chalk.bold(expectedVersion)}"\n\n`) +
            `Don't try to install it manually: your package manager does it automatically.\n` +
            `However, a different version of ${chalk.bold(
              dep
            )} was detected higher up in the tree:\n\n` +
            `  ${chalk.bold(chalk.red(maybeDep))} (version: ${chalk.bold(
              chalk.red(depPackageJson.version)
            )}) \n\n` +
            `Manually installing incompatible versions is known to cause hard-to-debug issues.\n\n` +
            `To ${chalk.green(
              'fix'
            )} the dependency tree, try following the steps below in the exact order:\n\n` +
            `  ${chalk.cyan('1.')} Delete ${chalk.bold('package-lock.json')} (${chalk.underline(
              'not'
            )} ${chalk.bold('package.json')}!) and/or ${chalk.bold(
              'yarn.lock'
            )} in your project folder.\n` +
            `  ${chalk.cyan('2.')} Delete ${chalk.bold('node_modules')} in your project folder.\n` +
            `  ${chalk.cyan('3.')} Remove "${chalk.bold(dep)}" from ${chalk.bold(
              'dependencies'
            )} and/or ${chalk.bold('devDependencies')} in the ${chalk.bold(
              'package.json'
            )} file in your project folder.\n` +
            `  ${chalk.cyan('4.')} Run ${chalk.bold('npm install')}\n\n` +
            chalk.cyan(
              `P.S. We know this message is long but please read the steps above :-) We hope you find them helpful!\n`
            )
        );
        process.exit(1);
      }
    });
  }
}

module.exports = verifyPackageTreeFrontier;
