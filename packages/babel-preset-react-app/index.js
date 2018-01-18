// ****************************************************************************
// IMPORTANT
// This file is no longer used as `packages/react-scripts/config/webpack.config.*.js`
// has been updated not to use `babel-preset-react-app`, but to instead use a
// `.babelrc` config that contains the equivalent configuration.
// ****************************************************************************

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const create = require('./create');

module.exports = function(api, opts) {
  // This is similar to how `env` works in Babel:
  // https://babeljs.io/docs/usage/babelrc/#env-option
  // We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
  // https://github.com/babel/babel/issues/4539
  // https://github.com/facebook/create-react-app/issues/720
  // It’s also nice that we can enforce `NODE_ENV` being specified.
  const env = process.env.BABEL_ENV || process.env.NODE_ENV;
  return create(api, opts, env);
};
