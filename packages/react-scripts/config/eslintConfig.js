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
const modules = require('./modules');

const baseConfig = {
  extends: [require.resolve('eslint-config-react-app/base')],
  rules: {
    ...(!modules.hasJsxRuntime && {
      'react/react-in-jsx-scope': 'error',
    }),
  },
};

module.exports = {
  extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
  cache: true,
  cacheLocation: path.resolve(paths.appNodeModules, '.cache/.eslintcache'),
  cwd: paths.appPath,
  resolvePluginsRelativeTo: __dirname,
  baseConfig,
};
