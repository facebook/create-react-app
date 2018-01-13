#!/usr/bin/env node
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

// Set this so that importing "../config/env" doesn't fail.
// In practice it won't matter because we'll spawn another process now.
process.env.NODE_ENV = 'development';
// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// We assume that having wrong versions of these
// in the tree will likely break your setup.
// This is a relatively low-effort way to find common issues.
function verifyPackageTree() {
  const depsToCheck = [
    // These are packages most likely to break in practice.
    // See https://github.com/facebookincubator/create-react-app/issues/1795 for reasons why.
    // I have not included Babel here because plugins typically don't import Babel (so it's not affected).
    'eslint',
    'jest',
    'webpack',
    'webpack-dev-server',
  ];
  // Inlined from semver-regex, MIT license.
  // Don't want to make this a dependency after ejecting.
  const getSemverRegex = () =>
    /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi;
  const ownPackageJson = require('../package.json');
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
            `There might be a problem with the project dependency tree.\n` +
              `It is likely ${chalk.bold(
                'not'
              )} a bug in Create React App, but something you need to fix locally.\n\n`
          ) +
            `The ${chalk.bold(
              'react-scripts'
            )} package provided by Create React App requires a dependency:\n\n` +
            chalk.green(
              `  "${chalk.bold(dep)}": "${chalk.bold(expectedVersion)}"\n\n`
            ) +
            `However, a different version of ${chalk.bold(
              dep
            )} was detected higher up in the tree:\n\n` +
            `  ${chalk.bold(chalk.red(maybeDep))} (version: ${chalk.bold(
              chalk.red(depPackageJson.version)
            )}) \n\n` +
            `This is known to cause hard-to-debug issues.\n` +
            `Try following these steps:\n\n` +
            `  ${chalk.cyan('1.')} Delete ${chalk.bold(
              'package-lock.json'
            )} (${chalk.underline('not')} ${chalk.bold(
              'package.json'
            )}!) and/or ${chalk.bold(
              'yarn.lock'
            )} in your project folder.\n\n` +
            `  ${chalk.cyan('2.')} Delete ${chalk.bold(
              'node_modules'
            )} in your project folder.\n\n` +
            `  ${chalk.cyan('3.')} Remove "${chalk.bold(
              dep
            )}" from ${chalk.bold('dependencies')} and/or ${chalk.bold(
              'devDependencies'
            )} in the ${chalk.bold(
              'package.json'
            )} file in your project folder.\n\n` +
            `  ${chalk.cyan('4.')} Run ${chalk.bold(
              'npm install'
            )} or ${chalk.bold(
              'yarn'
            )}, depending on the package manager you use.\n\n` +
            `If this has not helped, there are a few other things to try:\n\n` +
            `  ${chalk.cyan('5.')} If you used ${chalk.bold(
              'npm'
            )}, install ${chalk.bold(
              'yarn'
            )} (http://yarnpkg.com/) and repeat the above steps with it instead.\n` +
            `     This may help because npm has known issues with package hoisting which may get resolved in future versions.\n\n` +
            `  ${chalk.cyan('6.')} Check if ${chalk.bold(
              maybeDep
            )} is outside your project directory.\n` +
            `     For example, you might have installed something accidentally in your home folder.\n\n` +
            `  ${chalk.cyan('7.')} Try running ${chalk.bold(
              `npm ls ${dep}`
            )} in your project folder.\n` +
            `     This will tell you which ${chalk.underline(
              'other'
            )} package (apart from the expected ${chalk.bold(
              'react-scripts'
            )}) installed ${chalk.bold(dep)}.\n\n` +
            `If nothing else helps, add ${chalk.bold(
              'SKIP_PREFLIGHT_CHECK=true'
            )} to an ${chalk.bold('.env')} file in your project.\n` +
            `This permanently disables this preflight check in case you want to proceed anyway.\n\n` +
            chalk.cyan(
              `P.S. We know this message is long but please read the steps above :-) We hope you find them helpful!\n`
            )
        );
        process.exit(1);
      }
    });
  }
}

if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}

const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

switch (script) {
  case 'build':
  case 'eject':
  case 'start':
  case 'test': {
    const result = spawn.sync(
      'node',
      nodeArgs
        .concat(require.resolve('../scripts/' + script))
        .concat(args.slice(scriptIndex + 1)),
      { stdio: 'inherit' }
    );
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
    break;
  }
  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update react-scripts?');
    console.log(
      'See: https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#updating-to-new-releases'
    );
    break;
}
