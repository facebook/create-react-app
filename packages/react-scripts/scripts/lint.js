// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV =
  process.env.BABEL_ENV || process.env.NODE_ENV || 'development';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const paths = require('../config/paths');
const eslintConfig = require('../config/eslintConfig');
const formatter = require('react-dev-utils/eslintFormatter');

const { ESLint } = require('eslint');

(async function main() {
  const eslint = new ESLint(eslintConfig);
  const results = await eslint.lintFiles([paths.appSrc]);
  const resultText = formatter(results);
  console.log(resultText);
})().catch(error => {
  process.exitCode = 1;
  console.error(error);
});
