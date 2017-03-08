// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const webpack = require('webpack');
const config = require('../config/webpack.config.prod');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const FileSizeReporter = require('react-dev-utils/FileSizeReporter');

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;
const useYarn = fs.existsSync(paths.yarnLockFile);

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild);

  // Start the webpack build
  build(previousFileSizes);

  // Merge with the public folder
  copyPublicFolder();
});

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production build...');

  let compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    printErrors('Failed to compile.', [err]);
    process.exit(1);
  }

  compiler.run((err, stats) => {
    if (err) {
      printErrors('Failed to compile.', [err]);
      process.exit(1);
    }

    if (stats.compilation.errors.length) {
      printErrors('Failed to compile.', stats.compilation.errors);
      process.exit(1);
    }

    if (process.env.CI && stats.compilation.warnings.length) {
      printErrors(
        'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
        stats.compilation.warnings
      );
      process.exit(1);
    }

    console.log(chalk.green('Compiled successfully.'));
    console.log();

    console.log('File sizes after gzip:');
    console.log();
    printFileSizesAfterBuild(stats, previousFileSizes);
    console.log();

    const appPackage = require(paths.appPackageJson);
    const publicUrl = paths.publicUrl;
    const publicPath = config.output.publicPath;
    const publicPathname = url.parse(publicPath).pathname;
    if (publicUrl && publicUrl.indexOf('.github.io/') !== -1) {
      // "homepage": "http://user.github.io/project"
      console.log(
        `The project was built assuming it is hosted at ${chalk.green(publicPathname)}.`
      );
      console.log(
        `You can control this with the ${chalk.green('homepage')} field in your ${chalk.cyan('package.json')}.`
      );
      console.log();
      console.log(`The ${chalk.cyan('build')} folder is ready to be deployed.`);
      console.log(`To publish it at ${chalk.green(publicUrl)}, run:`);
      // If script deploy has been added to package.json, skip the instructions
      if (typeof appPackage.scripts.deploy === 'undefined') {
        console.log();
        if (useYarn) {
          console.log(`  ${chalk.cyan('yarn')} add --dev gh-pages`);
        } else {
          console.log(`  ${chalk.cyan('npm')} install --save-dev gh-pages`);
        }
        console.log();
        console.log(
          `Add the following script in your ${chalk.cyan('package.json')}.`
        );
        console.log();
        console.log(`    ${chalk.dim('// ...')}`);
        console.log(`    ${chalk.yellow('"scripts"')}: {`);
        console.log(`      ${chalk.dim('// ...')}`);
        console.log(
          `      ${chalk.yellow('"predeploy"')}: ${chalk.yellow('"npm run build",')}`
        );
        console.log(
          `      ${chalk.yellow('"deploy"')}: ${chalk.yellow('"gh-pages -d build"')}`
        );
        console.log('    }');
        console.log();
        console.log('Then run:');
      }
      console.log();
      console.log(`  ${chalk.cyan(useYarn ? 'yarn' : 'npm')} run deploy`);
      console.log();
    } else if (publicPath !== '/') {
      // "homepage": "http://mywebsite.com/project"
      console.log(
        `The project was built assuming it is hosted at ${chalk.green(publicPath)}.`
      );
      console.log(
        `You can control this with the ${chalk.green('homepage')} field in your ${chalk.cyan('package.json')}.`
      );
      console.log();
      console.log(`The ${chalk.cyan('build')} folder is ready to be deployed.`);
      console.log();
    } else {
      if (publicUrl) {
        // "homepage": "http://mywebsite.com"
        console.log(
          `The project was built assuming it is hosted at ${chalk.green(publicUrl)}.`
        );
        console.log(
          `You can control this with the ${chalk.green('homepage')} field in your ${chalk.cyan('package.json')}.`
        );
        console.log();
      } else {
        // no homepage
        console.log(
          'The project was built assuming it is hosted at the server root.'
        );
        console.log(
          `To override this, specify the ${chalk.green('homepage')} in your ${chalk.cyan('package.json')}.`
        );
        console.log('For example, add this to build it for GitHub Pages:');
        console.log();
        console.log(
          `  ${chalk.green('"homepage"')} ${chalk.cyan(':')} ${chalk.green('"http://myname.github.io/myapp"')}${chalk.cyan(',')}`
        );
        console.log();
      }
      const build = path.relative(process.cwd(), paths.appBuild);
      console.log(`The ${chalk.cyan(build)} folder is ready to be deployed.`);
      console.log('You may serve it with a static server:');
      console.log();
      if (useYarn) {
        console.log(`  ${chalk.cyan('yarn')} global add serve`);
      } else {
        console.log(`  ${chalk.cyan('npm')} install -g serve`);
      }
      console.log(`  ${chalk.cyan('serve')} -s build`);
      console.log();
    }
  });
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml,
  });
}
