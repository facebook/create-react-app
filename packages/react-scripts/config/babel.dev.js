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

var findCacheDir = require('find-cache-dir');

module.exports = {
  // Don't try to find .babelrc because we want to force this configuration.
  babelrc: false,
  // This is a feature of `babel-loader` for webpack (not Babel itself).
  // It enables caching results in ./node_modules/.cache/react-scripts/
  // directory for faster rebuilds. We use findCacheDir() because of:
  // https://github.com/facebookincubator/create-react-app/issues/483
  cacheDirectory: findCacheDir({
    name: 'react-scripts'
  }),
  presets: [
    require.resolve('babel-preset-react-app')
  ]
};
