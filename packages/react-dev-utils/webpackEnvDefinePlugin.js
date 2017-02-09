/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

/**
 * Generates a webpack define plugin config injecting environment variables that pass a regex test.
 * The function also support custom variables by passing them in the options argument
 *
 * @param {Object} options - The plugin configuration
 * @param {string} options.regex - The regex to select the environment variables by
 * @param {Object.<string, string>} options.customVariables - A map that its keys are the
 * custom injected environment
 * variable names and its values are the variable values
 * @returns - Returns a webpack define plugin configuration
 */
function envDefinePlugin(options) {
  const regex = options.regex || /.*/;
  const customVariables = options.customVariables || {};

  return getClientEnvironment(regex, customVariables);
}

/**
 * Grabs environment variables that meets the regex test and prepare them to be injected into the
 * application via DefinePlugin in Webpack configuration.
 * @param {string} regex - The regex to select the environment variables by
 * @param {Object.<string, string>} customVariables - A map where its keys are the custom injected environment
 * @returns {{[process.env]: *}} - A DefinePlugin configuration
 */
function getClientEnvironment(regex, customVariables) {
  const processEnv = Object
    .keys(process.env)
    .filter(key => regex.test(key))
    .reduce((env, key) => {
      env[key] = JSON.stringify(process.env[key]);
      return env;
    }, customVariables);
  return { 'process.env': processEnv };
}

module.exports = envDefinePlugin;
