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
const path = require('path');
const chalk = require('chalk');
const paths = require('./paths');

function isValidPath(path) {
  return (
    paths.relative(paths.appSrc, path) === '.' ||
    paths.relative(paths.appNodeModules, path) === '.'
  );
}

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

  const baseUrlResolved = path.resolve(paths.appDirectory, baseUrl);

  if (!isValidPath(baseUrlResolved)) {
    console.error(
      chalk.red.bold(
        "You tried to set baseUrl to anything other than 'src' or 'node_modules'.This is not supported in create-react-app and will be ignored."
      )
    );

    return null;
  }

  return path.resolve(paths.appDirectory, 'src');
}

/**
 * Get the alias of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAlias(options = {}) {
  const paths = options.paths || {};

  const alias = paths['@'];

  const others = Object.keys(paths).filter(function(value) {
    return value !== '@';
  });

  if (others.length) {
    console.error(
      chalk.red.bold(
        'You tried to set one or more paths with an alias other than "@", this is currently not supported in create-react-app and will be ignored.'
      )
    );
  }

  if (!alias) {
    return {};
  }

  if (alias.toString() !== 'src') {
    console.error(
      chalk.red.bold(
        "You tried to set a path with alias '@' to anything other than ['src']. This is not supported in create-react-app and will be ignored."
      )
    );
  }

  return {
    '@': path.resolve(appDirectory, 'src'),
  };
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
    alias: getAlias(options),
    baseUrl: getBaseUrl(options),
    useTypeScript,
  };
}

module.exports = getConfig();
