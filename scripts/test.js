/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'test';

const createJestConfig = require('./utils/createJestConfig');
const jest = require('jest');
const path = require('path');
const paths = require('../config/paths');

const argv = process.argv.slice(2);

// Don't pass this option to Jest
const debugTemplateIndex = argv.indexOf('--debug-template');
if (debugTemplateIndex !== -1) {
  argv.splice(debugTemplateIndex, 1);
}

argv.push('--config', JSON.stringify(createJestConfig(
  relativePath => path.resolve(__dirname, '..', relativePath),
  path.resolve(paths.appSrc, '..')
)));

jest.run(argv);
