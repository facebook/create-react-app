// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('react-dev-utils/chalk');
const paths = require('../../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],

    // TODO: this breaks Yarn PnP on eject.
    // But we can't simply emit this because it'll be an absolute path.
    // The proper fix is to write jest.config.js on eject instead of a package.json key.
    // Then these can always stay as require.resolve()s.
    resolver: isEjecting
      ? 'jest-pnp-resolver'
      : require.resolve('jest-pnp-resolver'),
    setupFiles: [
      isEjecting
        ? 'react-app-polyfill/jsdom'
        : require.resolve('react-app-polyfill/jsdom'),
    ],
    setupFilesAfterEnv: fs.existsSync(paths.testsSetup)
      ? [`<rootDir>/${path.relative(paths.appPath, paths.testsSetup)}`]
      : [],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': isEjecting
        ? '<rootDir>/node_modules/babel-jest'
        : resolve('config/jest/babelTransform.js'),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': resolve(
        'config/jest/fileTransform.js'
      ),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$',
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
    moduleFileExtensions: [...paths.moduleFileExtensions, 'node'].filter(
      ext => !ext.includes('mjs')
    ),
    watchPlugins: [
      require.resolve('jest-watch-typeahead/filename'),
      require.resolve('jest-watch-typeahead/testname'),
    ],
  };

  if (rootDir) {
    config.rootDir = rootDir;
  }

  const appJestConfig = require(paths.appPackageJson).jest;

  if (appJestConfig) {
    const officiallySupportedJestConfigOverrides = [
      'collectCoverageFrom',
      'coverageReporters',
      'coverageThreshold',
      'globalSetup',
      'globalTeardown',
      'resetMocks',
      'resetModules',
      'setupFilesAfterEnv',
      'snapshotSerializers',
      'watchPathIgnorePatterns',
    ];

    const unsupportedAppJestConfigKeys = Object.keys(appJestConfig)
      .filter(key => !officiallySupportedJestConfigOverrides.includes(key));

    if (unsupportedAppJestConfigKeys.length) {
      console.error(
        chalk.red(
          '\nOut of the box, Create React App only supports overriding ' +
            'these Jest options:\n\n' +
            officiallySupportedJestConfigOverrides
              .map(key => chalk.bold('  \u2022 ' + key))
              .join('\n') +
            '.\n\n' +
            'These options in your package.json Jest configuration ' +
            'are not currently supported by Create React App:\n\n' +
            unsupportedAppJestConfigKeys
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

    officiallySupportedJestConfigOverrides
      .filter(supportedKey => appJestConfig.hasOwnProperty(supportedKey))
      .forEach(key => {
        config[key] = appJestConfig[key];
      });
  }

  return config;
};
