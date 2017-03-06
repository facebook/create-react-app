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
'use strict';

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
// Used .env* files - https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
var fs = require('fs');
var paths = require('./paths');

var sequence = {
  'development': [
    paths.dotenvDevelopmentLocal,
    paths.dotenvDevelopment,
    paths.dotenvLocal,
    paths.dotenv
  ],
  'test': [
    paths.dotenvTestLocal,
    paths.dotenvTest,
    paths.dotenvLocal,
    paths.dotenv
  ],
  'production': [
    paths.dotenvProductionLocal,
    paths.dotenvProduction,
    paths.dotenvLocal,
    paths.dotenv
  ]
};

var envConfigs = sequence[process.env.NODE_ENV];

if (envConfigs) {
  envConfigs.forEach(envConfig => {
    if (fs.existsSync(envConfig)) {
      require('dotenv').config({
        silent: true,
        path: envConfig
      });
    }
  });
}
