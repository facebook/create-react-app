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
const path = require('path');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = pathExists.sync(paths.testsSetup) ? '<rootDir>/src/setupTests.js' : undefined;

  const compilerOptions = require(path.resolve('./tsconfig.json')).compilerOptions;
  // Jest gives `SyntaxError: Unexpected token import` error when ES6 module are emitted
  compilerOptions.module = "commonjs";
  // Expected Babel transformer to convert jsx to js
  // but Jest gives `SyntaxError: Unexpected token <` error when set to preserve
  compilerOptions.jsx = "react";

  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
    moduleFileExtensions: ['jsx', 'js', 'json', 'ts', 'tsx'],
    moduleNameMapper: {
      '^.+\\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': resolve('config/jest/FileStub.js'),
      '^.+\\.css$': resolve('config/jest/CSSStub.js')
    },
    setupFiles: [resolve('config/polyfills.js')],
    setupTestFrameworkScriptFile: setupTestsFile,
    testPathIgnorePatterns: ['<rootDir>/(build|docs|node_modules)/'],
    testEnvironment: 'node',
    testRegex: "(/__tests__/.*|\.(test|spec))\.(ts|tsx|js|jsx)$",
    testResultsProcessor: require.resolve("ts-jest/coverageprocessor"),
    scriptPreprocessor: resolve('config/jest/transform.js'),
    globals: {
      "__TS_CONFIG__": compilerOptions
    }
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  return config;
};
