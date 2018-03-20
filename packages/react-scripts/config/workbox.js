// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const { GenerateSW } = require('workbox-webpack-plugin');

const workboxConfig = {
  exclude: [/\.map$/, /^(?:asset-)manifest.*\.js(?:on)?$/],
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [/^(?!\/__).*/], // fix for Firebase
};

const plugin = new GenerateSW(workboxConfig);
module.exports = plugin;
