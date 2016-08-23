/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = (resolve, rootDir) => {
  const config = {
    automock: false,
    moduleNameMapper: {
      '^[./a-zA-Z0-9$_-]+\\.(jpg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm)$': resolve('config/jest/FileStub.js'),
      '^[./a-zA-Z0-9$_-]+\\.css$': resolve('config/jest/CSSStub.js')
    },
    persistModuleRegistryBetweenSpecs: true,
    scriptPreprocessor: resolve('config/jest/transform.js'),
    setupFiles: [
      resolve('config/polyfills.js')
    ],
    setupTestFrameworkScriptFile: resolve('config/jest/environment.js'),
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],
    // Allow three popular conventions:
    // **/__tests__/*.js
    // **/*.test.js
    // **/*.spec.js
    testRegex: '(__tests__/.*|\\.(test|spec))\\.js$',
    testEnvironment: 'node',
    verbose: true
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  return config;
};
