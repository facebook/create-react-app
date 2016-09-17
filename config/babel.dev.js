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
var path = require('path');

module.exports = function (resolvePaths) {
  return {
    // Don't try to find .babelrc because we want to force this configuration.
    babelrc: false,
    presets: [
      // Latest stable ECMAScript features
      'babel-preset-latest',
      // JSX, Flow
      'babel-preset-react'
    ].map(function (preset) {
      if (resolvePaths) {
        return require.resolve(preset);
      }

      return preset;
    }),
    plugins: [
      // class { handleClick = () => { } }
      'babel-plugin-transform-class-properties',
      // { ...todo, completed: true }
      'babel-plugin-transform-object-rest-spread',
      // function* () { yield 42; yield 43; }
      ['babel-plugin-transform-regenerator', {
        // Async functions are converted to generators by babel-preset-latest
        async: false
      }],
      // Polyfills the runtime needed for async/await and generators
      ['babel-plugin-transform-runtime', {
        helpers: false,
        polyfill: false,
        regenerator: true,
        // Resolve the Babel runtime relative to the config.
        // You can safely remove this after ejecting:
        moduleName: path.dirname(require.resolve('babel-runtime/package'))
      }]
    ].map(function (plugin) {
      if (resolvePaths) {
        return Array.isArray(plugin) ?
          [require.resolve(plugin[0]), plugin[1]] :
          require.resolve(plugin);
      }

      return plugin;
    })
  }
};
