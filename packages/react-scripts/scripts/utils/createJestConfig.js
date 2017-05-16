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

const fs = require('fs');
const chalk = require('chalk');
const paths = require('../../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.js'
    : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.js?(x)',
      '<rootDir>/src/**/?(*.)(spec|test).js?(x)',
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx)$': isEjecting
        ? '<rootDir>/node_modules/babel-jest'
        : resolve('config/jest/babelTransform.js'),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|css|json)$)': resolve('config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
    },
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  if (overrides) {
    if (overrides.collectCoverageFrom) {
      config.collectCoverageFrom = overrides.collectCoverageFrom;
      delete overrides.collectCoverageFrom;
    }
    if (overrides.coverageReporters) {
      config.coverageReporters = overrides.coverageReporters;
      delete overrides.coverageReporters;
    }
    if (overrides.coverageThreshold) {
      config.coverageThreshold = overrides.coverageThreshold;
      delete overrides.coverageThreshold;
    }
    if (overrides.snapshotSerializers) {
      config.snapshotSerializers = overrides.snapshotSerializers;
      delete overrides.snapshotSerializers;
    }
    const unsupportedKeys = Object.keys(overrides);
    if (unsupportedKeys.length) {
      console.error(
        chalk.red(
          'By default, Create React App only supports overriding the following Jest options: ' +
            chalk.bold('collectCoverageFrom') +
            ', ' +
            chalk.bold('coverageReporters') +
            ', ' +
            chalk.bold('coverageThreshold') +
            ', and ' +
            chalk.bold('snapshotSerializers') +
            '\n\nIf you wish to override other options, you need to eject from the default setup. ' +
            'You can do so by running ' +
            chalk.bold('npm run eject') +
            ' but remember that this is a one-way operation.\n'
        )
      );
      process.exit(1);
    }
  }
  return config;
};
