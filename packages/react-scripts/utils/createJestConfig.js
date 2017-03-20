/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

// Note: this file does not exist after ejecting.

const fs = require('fs');
const paths = require('../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup) ? '<rootDir>/src/setupTests.ts' : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testPathIgnorePatterns: [
      '<rootDir>[/\\\\](build|docs|node_modules|scripts)[/\\\\]'
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^.+\\.tsx?$': resolve('config/jest/typescriptTransform.js'),
      '^(?!.*\\.(css|json)$)': resolve('config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'
    ],
    moduleNameMapper: {
      '^react-native$': 'react-native-web'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  return config;
};
