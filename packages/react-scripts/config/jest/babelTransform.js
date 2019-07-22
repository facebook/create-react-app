// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const babelJest = require('babel-jest');

// Check if emotion babel plugin should be applied
const shouldApplyEmotionPlugin = require('../utils/shouldApplyEmotionBabelPlugin');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-react-app')],
  babelrc: false,
  configFile: false,
  plugins: [
    'babel-plugin-import-remove-resource-query',
    'require-context-hook',
    '@loadable/babel-plugin',
    shouldApplyEmotionPlugin && [
      'emotion',
      require('../utils/getEmotionBabelPluginConfig'),
    ],
  ].filter(Boolean)
});
