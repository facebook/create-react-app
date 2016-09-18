/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var path = require('path');
var paths = require('./paths');

module.exports = {
  // when TypeScript emits a file, pass it to Babel to provide backwards compatibility
  useBabel: true,
  // these are the options to use
  babelOptions: require('./babel.prod'),
  // tell the loader where the path is
  babelCore: path.join(paths.appNodeModules, 'babel-core')
};