/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/iframeScript.js',
  output: {
    path: path.join(__dirname, './lib'),
    filename: 'iframe-bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"production"' },
      __REACT_DEVTOOLS_GLOBAL_HOOK__:
        '__REACT_ERROR_OVERLAY_GLOBAL_HOOK_NOOP__',
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
        ascii_only: false,
      },
    }),
  ],
};
