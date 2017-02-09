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

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.

var REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  var vars = Object
    .keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {
      // Useful for determining whether we’re running in production mode.
      // Most importantly, it switches React into the correct mode.
      'NODE_ENV': process.env.NODE_ENV || 'development',
      // Useful for resolving the correct path to static assets in `public`.
      // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
      // This should only be used as an escape hatch. Normally you would put
      // images into the `src` and `import` them in code to get their paths.
      'PUBLIC_URL': publicUrl
    });
  // Stringify all values so we can feed into Webpack DefinePlugin
  var string = Object
    .keys(vars)
    .reduce((env, key) => {
      env[key] = JSON.stringify(vars[key]);
      return env;
    }, {});

  return {
    vars: vars,
    string: string,
  };
}

module.exports = getClientEnvironment;
