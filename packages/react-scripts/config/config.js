// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const paths = require('./paths');

/**
 * Get the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 */
function getBaseUrl(options = {}) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return null;
  }

  if (baseUrl !== 'src' && baseUrl !== './src') {
    console.error(
      chalk.red.bold(
        "You tried to set baseUrl to anything other than 'src'. This is not supported in create-react-app and will be ignored."
      )
    );

    return null;
  }

  return 'src';
}

/**
 * Get the paths of a compilerOptions object.
 *
 * @param {Object} options
 */
function getPaths(options = {}) {
  const paths = options.paths;

  if (!paths) {
    return [];
  }
}

function getConfig() {
  // Check if TypeScript is setup
  const useTypeScript = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  let config;

  // If there's a tsconfig.json we assume it's a
  // Typescript project and set up the config
  // based on tsconfig.json
  if (useTypeScript) {
    config = require(paths.appTsConfig);
    // Otherwise we'll check if there is jsconfig.json
    // for non TS projects.
  } else if (hasJsConfig) {
    config = require(paths.appJsConfig);
  }

  config = config || {};
  const options = config.compilerOptions || {};

  return {
    paths: getPaths(options),
    baseUrl: getBaseUrl(options),
    useTypeScript,
  };
}

module.exports = getConfig();
