/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var path = require('path');

module.exports = {
  presets: [
    // Latest stable ECMAScript features
    require.resolve('babel-preset-latest'),
    // JSX, Flow
    require.resolve('babel-preset-react')
  ],
  plugins: [
    // class { handleClick = () => { } }
    require.resolve('babel-plugin-transform-class-properties'),
    // { ...todo, completed: true }
    require.resolve('babel-plugin-transform-object-rest-spread'),
    // function* () { yield 42; yield 43; }
    [require.resolve('babel-plugin-transform-regenerator'), {
      // Async functions are converted to generators by babel-preset-latest
      async: false
    }],
    // Polyfills the runtime needed for async/await and generators
    [require.resolve('babel-plugin-transform-runtime'), {
      helpers: false,
      polyfill: false,
      regenerator: true,
      // Resolve the Babel runtime relative to the config.
      moduleName: path.dirname(require.resolve('babel-runtime/package'))
    }]
  ],
  env: {
    production: {
      plugins: [
        // Optimization: hoist JSX that never changes out of render()
        // Disabled because of issues:
        // * https://github.com/facebookincubator/create-react-app/issues/525
        // * https://phabricator.babeljs.io/search/query/pCNlnC2xzwzx/
        // * https://github.com/babel/babel/issues/4516
        // TODO: Enable again when these issues are resolved.
        // require.resolve('babel-plugin-transform-react-constant-elements')
      ]
    }
  }
};
