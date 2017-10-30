/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const escapeStringRegexp = require('escape-string-regexp');

module.exports = function watchOptionsRegex(paths) {
  return new RegExp(
    `^(?!${escapeStringRegexp(path.join(paths.appSrc, '/'))}).+node_modules`,
    'g'
  );
};
