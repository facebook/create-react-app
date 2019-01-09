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

/**
 * Get the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAdditionalModulePath(options = {}) {
  const baseUrl = options.baseUrl;

  // We need to explicitly check for null and undefined (and not a falsy value) because
  // TypeScript treats an empty string as `.`.
  if (baseUrl == null) {
    return null;
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
  // the default behavior.
  if (path.relative(paths.appNodeModules, baseUrlResolved) === '') {
    return null;
  }

  // Allow the user set the `baseUrl` to `appSrc`.
  if (path.relative(paths.appSrc, baseUrlResolved) === '') {
    return paths.appSrc;
  }

  // Otherwise, throw an error.
  throw new Error(
    chalk.red.bold(
      "Your project's `baseUrl` can only be set to `src` or `node_modules`." +
        ' Create React App does not support other values at this time.'
    )
  );
}

/**
 * Get the alias of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAliases(options = {}) {
  // This is an object with the alias as key
  // and an array of paths as value.
  // e.g. '@': ['src']
  const aliases = options.paths || {};

  return Object.keys(aliases).reduce(function(prev, alias) {
    // Value contains the paths of the alias.
    const value = aliases[alias];

    // The value should be an array but we have to verify
    // that because it's user input.
    if (!Array.isArray(value) || value.length > 1) {
      throw new Error(
        chalk.red.bold(
          "Your project's `alias` can only be set to an array containing `src` or a subfolder of `src`." +
            ' Create React App does not support other values at this time.'
        )
      );
    }

    const aliasPath = value[0];

    // Alias paths are relative to the baseurl.
    // If there is no baseUrl set, it will default to the root of the app.
    const baseUrl = options.baseUrl
      ? path.resolve(paths.appPath, options.baseUrl)
      : paths.appPath;
    const resolvedAliasPath = path.resolve(baseUrl, aliasPath);

    // We then check if the resolved alias path is src or a sub folder of src.
    const relativePath = path.relative(paths.appSrc, resolvedAliasPath);
    const isSrc = relativePath === '';
    const isSubfolderOfSrc =
      !relativePath.startsWith('../') && !relativePath.startsWith('..\\');

    if (!isSrc && !isSubfolderOfSrc) {
      throw new Error(
        chalk.red.bold(
          "Your project's `alias` can only be set to ['src'] or a subfolder of `src`." +
            ' Create React App does not support other values at this time.'
        )
      );
    }

    prev[alias] = resolvedAliasPath;
    return prev;
  }, {});
}

function getWebpackAliases(aliases) {
  return Object.keys(aliases).reduce(function(prev, alias) {
    let aliasPath = aliases[alias];
    const endsWithWilcard = alias.endsWith('*');
    // Remove trailing wildcards (/*)
    alias = alias.replace(/\/?\*$/, '');
    aliasPath = aliasPath.replace(/\/\*$/, '');
    // Webpack aliases work a little bit different than jsconfig/tsconfig.json paths
    // By default webpack aliases act as a wildcard and for an exact match you have
    // to suffix it with a dollar sign.
    // tsconfig/jsconfig.json work the other way around and are an exact match unless
    // suffixed by a wildcard.
    const webpackAlias = endsWithWilcard ? alias : alias + '$';
    prev[webpackAlias] = aliasPath;
    return prev;
  }, {});
}

function getJestAliases(aliases) {
  return Object.keys(aliases).reduce(function(prev, alias) {
    const endsWithWilcard = alias.endsWith('*');
    let aliasPath = aliases[alias];

    alias = alias.replace(/\/?\*$/, '');
    const match = endsWithWilcard ? alias + '(.*)$' : alias;

    aliasPath = aliasPath.replace(/\*$/, '');
    const relativeAliasPath = path.relative(paths.appPath, aliasPath);
    const target = '<rootDir>/' + relativeAliasPath;

    prev[match] = target + (endsWithWilcard ? '/$1' : '');
    return prev;
  }, {});
}

function getModules() {
  // Check if TypeScript is setup
  const useTypeScript = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  if (useTypeScript && hasJsConfig) {
    throw new Error(
      'You have both a tsconfig.json and a jsconfig.json. If you are using Typescript please remove your jsconfig.json file.'
    );
  }

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

  const aliases = getAliases(options);
  const jestAliases = getJestAliases(aliases);
  const webpackAliases = getWebpackAliases(aliases);
  const additionalModulePath = getAdditionalModulePath(options);

  return {
    aliases: aliases,
    jestAliases: jestAliases,
    webpackAliases: webpackAliases,
    additionalModulePath: additionalModulePath,
    useTypeScript,
  };
}

module.exports = getModules();
