/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const browserslist = require('browserslist');
const chalk = require('chalk');
const os = require('os');
const inquirer = require('inquirer');
const pkgUp = require('pkg-up');
const fs = require('fs');

const defaultBrowsers = {
  development: ['chrome', 'firefox', 'edge'].map(
    browser => `last 2 ${browser} versions`
  ),
  production: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 11'],
};

function checkBrowsers(dir, retry = true) {
  const current = browserslist.findConfig(dir);
  if (current != null) {
    return Promise.resolve(current);
  }

  if (!retry) {
    return Promise.reject(
      new Error(
        chalk.red(
          'As of react-scripts >=2 you must specify targeted browsers.'
        ) +
          os.EOL +
          `Please add a ${chalk.underline(
            'browserslist'
          )} key to your ${chalk.bold('package.json')}.`
      )
    );
  }

  const question = {
    type: 'confirm',
    name: 'shouldSetBrowsers',
    message:
      chalk.yellow("We're unable to detect target browsers.") +
      `\n\nWould you like to add the defaults to your ${chalk.bold(
        'package.json'
      )}?`,
    default: true,
  };
  return inquirer.prompt(question).then(answer => {
    if (answer.shouldSetBrowsers) {
      return (
        pkgUp(dir)
          .then(filePath => {
            if (filePath == null) {
              return Promise.reject();
            }
            const pkg = JSON.parse(fs.readFileSync(filePath));
            pkg['browserslist'] = defaultBrowsers;
            fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + os.EOL);

            browserslist.clearCaches();
            console.log();
            console.log(chalk.green('Set target browsers:'));
            console.log();
            console.log(
              `\t${chalk.bold('Production')}: ${chalk.cyan(
                defaultBrowsers.production.join(', ')
              )}`
            );
            console.log(
              `\t${chalk.bold('Development')}: ${chalk.cyan(
                defaultBrowsers.development.join(', ')
              )}`
            );
            console.log();
          })
          // Swallow any error
          .catch(() => {})
          .then(() => checkBrowsers(dir, false))
      );
    } else {
      return checkBrowsers(dir, false);
    }
  });
}

function printBrowsers(dir) {
  return checkBrowsers(dir).then(browsers => {
    if (browsers == null) {
      console.log('Built the bundle with default browser support.');
      return;
    }
    browsers = browsers[process.env.NODE_ENV] || browsers;
    if (Array.isArray(browsers)) {
      browsers = browsers.join(', ');
    }
    console.log(
      `Built the bundle with browser support for ${chalk.cyan(browsers)}.`
    );
  });
}

module.exports = { defaultBrowsers, checkBrowsers, printBrowsers };
