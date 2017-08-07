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

module.exports = (resolve, rootDir) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.ts'
    : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    mapCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    moduleFileExtensions: [
      'web.ts',
      'ts',
      'web.tsx',
      'tsx',
      'web.js',
      'js',
      'web.jsx',
      'jsx',
      'json',
    ],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.ts?(x)',
      '<rootDir>/src/**/?(*.)(spec|test).ts?(x)',
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^.+\\.tsx?$': resolve('config/jest/typescriptTransform.js'),
      '^(?!.*\\.(css|json)$)': resolve('config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
    },
    globals: {
      'ts-jest': {
        tsConfigFile: paths.appTsTestConfig,
      },
    }
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'snapshotSerializers',
  ];
  if (overrides) {
    supportedKeys.forEach(key => {
      if (overrides.hasOwnProperty(key)) {
        config[key] = overrides[key];
        delete overrides[key];
      }
    });
    const unsupportedKeys = Object.keys(overrides);
    if (unsupportedKeys.length) {
      console.error(
        chalk.red(
          'Out of the box, Create React App only supports overriding ' +
            'these Jest options:\n\n' +
            supportedKeys.map(key => chalk.bold('  \u2022 ' + key)).join('\n') +
            '.\n\n' +
            'These options in your package.json Jest configuration ' +
            'are not currently supported by Create React App:\n\n' +
            unsupportedKeys
              .map(key => chalk.bold('  \u2022 ' + key))
              .join('\n') +
            '\n\nIf you wish to override other Jest options, you need to ' +
            'eject from the default setup. You can do so by running ' +
            chalk.bold('npm run eject') +
            ' but remember that this is a one-way operation. ' +
            'You may also file an issue with Create React App to discuss ' +
            'supporting more options out of the box.\n'
        )
      );
      process.exit(1);
    }
  }
  return config;
};
