// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

/**
 * Greetings! If you are here attempting to start a debugging session, please
 * ensure that your debugger of choice is configured to enable source maps,
 * otherwise your code may appear mangled by babel!
 */
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true});

const jest = require('jest');
const argv = process.argv.slice(2);
const debugFlag = require('../utils/getDebugFlag')(argv);
const isDebug = !!debugFlag;
const isRunInBand = argv.indexOf('--runInBand') > -1 || argv.indexOf('-i') > -1

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf('--coverage') < 0 && !isDebug) {
  argv.push('--watch');
}

// Force debug into single worker
if (isDebug) {
  if (!isRunInBand) {
    argv.push('--runInBand')
  }
  argv.splice(argv.indexOf(debugFlag), 1)
}

// @remove-on-eject-begin
// This is not necessary after eject because we embed config into package.json.
const createJestConfig = require('../utils/createJestConfig');
const path = require('path');
const paths = require('../config/paths');
argv.push('--config', JSON.stringify(createJestConfig({
  resolve: relativePath => path.resolve(__dirname, '..', relativePath),
  rootDir: path.resolve(paths.appSrc, '..'),
  isDebug: isDebug
})));
// @remove-on-eject-end
jest.run(argv);
