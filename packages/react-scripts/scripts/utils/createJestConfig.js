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
const chalk = require('chalk');
const paths = require('../../config/paths');

module.exports = (resolve, rootDir, srcRoots) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.js'
    : undefined;

  const toRelRootDir = f => '<rootDir>/' + path.relative(rootDir || '', f);

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx,mjs}'],
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testMatch: [
      '**/__tests__/**/*.{js,jsx,mjs}',
      '**/?(*.)(spec|test).{js,jsx,mjs}',
    ],
    // where to search for files/tests
    roots: srcRoots.map(toRelRootDir),
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|mjs)$': resolve('config/jest/babelTransform.js'),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^.+\\.(graphql)$': resolve('config/jest/graphqlTransform.js'),
      '^(?!.*\\.(js|jsx|mjs|css|json|graphql)$)': resolve(
        'config/jest/fileTransform.js'
      ),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$',
      '^.+\\.module\\.css$',
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web',
      '^.+\\.module\\.css$': 'identity-obj-proxy',
    },
    moduleFileExtensions: [
      'web.js',
      'mjs',
      'js',
      'json',
      'web.jsx',
      'jsx',
      'node',
    ],
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }

  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'resetMocks',
    'resetModules',
    'snapshotSerializers',
    'watchPathIgnorePatterns',
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
      const isOverridingSetupFile =
        unsupportedKeys.indexOf('setupTestFrameworkScriptFile') > -1;

      if (isOverridingSetupFile) {
        console.error(
          chalk.red(
            'We detected ' +
              chalk.bold('setupTestFrameworkScriptFile') +
              ' in your package.json.\n\n' +
              'Remove it from Jest configuration, and put the initialization code in ' +
              chalk.bold('src/setupTests.js') +
              '.\nThis file will be loaded automatically.\n'
          )
        );
      } else {
        console.error(
          chalk.red(
            '\nOut of the box, Create React App only supports overriding ' +
              'these Jest options:\n\n' +
              supportedKeys
                .map(key => chalk.bold('  \u2022 ' + key))
                .join('\n') +
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
      }

      process.exit(1);
    }
  }
  return config;
};
