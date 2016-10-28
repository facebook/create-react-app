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

  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
    moduleFileExtensions: ['jsx', 'js', 'json'],
    moduleNameMapper: {
      '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': resolve('config/jest/FileStub.js'),
      '^.+\\.css$': resolve('config/jest/CSSStub.js')
    },
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testPathIgnorePatterns: ['<rootDir>/(build|docs|node_modules)/'],
    testEnvironment: 'node',
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  if (!isEjecting) {
    // This is unnecessary after ejecting because Jest
    // will just use .babelrc in the project folder.
    config.scriptPreprocessor = resolve('config/jest/transform.js');
  }
  return config;
};
