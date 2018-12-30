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

// We assume that having wrong versions of these
// in the tree will likely break your setup.
// This is a relatively low-effort way to find common issues.
function verifyPackageTree() {
  const depsToCheck = [
    // These are packages most likely to break in practice.
    // See https://github.com/facebook/create-react-app/issues/1795 for reasons why.
    // I have not included Babel here because plugins typically don't import Babel (so it's not affected).
    'babel-eslint',
    'babel-jest',
    'babel-loader',
    'eslint',
    'jest',
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
      const depPackageJson = JSON.parse(
        fs.readFileSync(maybeDepPackageJson, 'utf8')
      );
      const expectedVersion = expectedVersionsByDep[dep];
      if (depPackageJson.version !== expectedVersion) {
        console.error(
          chalk.red(
            `\nThere might be a problem with the project dependency tree.\n` +
              `It is likely ${chalk.bold(
                'not'
              )} a bug in Create React App, but something you need to fix locally.\n\n`
          ) +
            `The ${chalk.bold(
              ownPackageJson.name
            )} package provided by Create React App requires a dependency:\n\n` +
            chalk.green(
              `  "${chalk.bold(dep)}": "${chalk.bold(expectedVersion)}"\n\n`
            ) +
            `Don't try to install it manually: your package manager does it automatically.\n` +
            `However, a different version of ${chalk.bold(
              dep
            )} was detected higher up in the tree:\n\n` +
            `  ${chalk.bold(chalk.red(maybeDep))} (version: ${chalk.bold(
              chalk.red(depPackageJson.version)
            )}) \n\n` +
            `Manually installing incompatible versions is known to cause hard-to-debug issues.\n\n` +
            chalk.red(
              `If you would prefer to ignore this check, add ${chalk.bold(
                'SKIP_PREFLIGHT_CHECK=true'
              )} to an ${chalk.bold('.env')} file in your project.\n` +
                `That will permanently disable this message but you might encounter other issues.\n\n`
            ) +
            `To ${chalk.green(
              'fix'
            )} the dependency tree, try following the steps below in the exact order:\n\n` +
            `  ${chalk.cyan('1.')} Delete ${chalk.bold(
              'package-lock.json'
            )} (${chalk.underline('not')} ${chalk.bold(
              'package.json'
            )}!) and/or ${chalk.bold('yarn.lock')} in your project folder.\n` +
            `  ${chalk.cyan('2.')} Delete ${chalk.bold(
              'node_modules'
            )} in your project folder.\n` +
            `  ${chalk.cyan('3.')} Remove "${chalk.bold(
              dep
            )}" from ${chalk.bold('dependencies')} and/or ${chalk.bold(
              'devDependencies'
            )} in the ${chalk.bold(
              'package.json'
            )} file in your project folder.\n` +
            `  ${chalk.cyan('4.')} Run ${chalk.bold(
              'npm install'
            )} or ${chalk.bold(
              'yarn'
            )}, depending on the package manager you use.\n\n` +
            `In most cases, this should be enough to fix the problem.\n` +
            `If this has not helped, there are a few other things you can try:\n\n` +
            `  ${chalk.cyan('5.')} If you used ${chalk.bold(
              'npm'
            )}, install ${chalk.bold(
              'yarn'
            )} (http://yarnpkg.com/) and repeat the above steps with it instead.\n` +
            `     This may help because npm has known issues with package hoisting which may get resolved in future versions.\n\n` +
            `  ${chalk.cyan('6.')} Check if ${chalk.bold(
              maybeDep
            )} is outside your project directory.\n` +
            `     For example, you might have accidentally installed something in your home folder.\n\n` +
            `  ${chalk.cyan('7.')} Try running ${chalk.bold(
              `npm ls ${dep}`
            )} in your project folder.\n` +
            `     This will tell you which ${chalk.underline(
              'other'
            )} package (apart from the expected ${chalk.bold(
              ownPackageJson.name
            )}) installed ${chalk.bold(dep)}.\n\n` +
            `If nothing else helps, add ${chalk.bold(
              'SKIP_PREFLIGHT_CHECK=true'
            )} to an ${chalk.bold('.env')} file in your project.\n` +
            `That would permanently disable this preflight check in case you want to proceed anyway.\n\n` +
            chalk.cyan(
              `P.S. We know this message is long but please read the steps above :-) We hope you find them helpful!\n`
            )
        );
        process.exit(1);
      }
    });
  }
}

module.exports = verifyPackageTree;
