// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const paths = require('./paths');
const fs = require('fs');
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');

const defaultGenerateConfig = {
  exclude: [/\.map$/, /^(?:asset-)manifest.*\.js(?:on)?$/],
  navigateFallback: '/index.html',
  navigateFallbackWhitelist: [/^(?!\/__).*/], // fix for Firebase
};

const defaultInjectConfig = {
  exclude: defaultGenerateConfig.exclude,
  swSrc: path.join(paths.appSrc, 'sw.js'),
};

// Default method is generate
let method = 'generate';
let workboxConfig;

const craConfigPath = paths.craConfig;
if (fs.existsSync(craConfigPath)) {
  const craConfig = require(craConfigPath);
  if ('workbox' in craConfig) {
    // 'method' should be either 'generate' or 'inject'
    method = craConfig.workbox.method || method;
    workboxConfig =
      method === 'generate' ? defaultGenerateConfig : defaultInjectConfig;
    workboxConfig = craConfig.workbox.config || workboxConfig;
  }
}

const plugin =
  method === 'generate'
    ? new GenerateSW(workboxConfig)
    : new InjectManifest(workboxConfig);
module.exports = plugin;
