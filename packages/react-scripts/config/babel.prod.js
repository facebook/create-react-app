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

module.exports = {
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,
  presets: [
    require.resolve('babel-preset-react-app')
  ]
};
