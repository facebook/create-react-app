/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Note: this file does not exist after ejecting.

const pathExists = require('path-exists');
const paths = require('../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = pathExists.sync(paths.testsSetup) ? '<rootDir>/src/setupTests.js' : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    testPathDirs: [ 'spec', 'src' ],
    testRegex: '.*spec\\.(es6|js)$',
    moduleDirectories: [ 'src', 'node_modules' ],
    moduleFileExtensions: [ 'js', 'json', 'es6', 'jsx' ],
    coverageDirectory: 'artifacts/coverage',
    coverageReporters: ['lcov'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx,es6}'],
    moduleNameMapper: {
      '^.+\\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': resolve('config/jest/FileStub.js'),
      '^.+\\.s?css$': resolve('config/jest/CSSStub.js')
    },
    setupFiles: [require.resolve('babel-polyfill')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testPathIgnorePatterns: [
      '<rootDir>[/\\\\](build|docs|node_modules)[/\\\\]'
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx|es6)$': isEjecting ?
        '<rootDir>/node_modules/babel-jest'
        : resolve('config/jest/babelTransform.js'),
      '^.+\\.s?css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|css|json|es6|scss)$)': resolve('config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web'
    }
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  return config;
};
