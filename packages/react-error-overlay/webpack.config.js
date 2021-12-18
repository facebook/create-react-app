/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const path = require('path');

module.exports = {
  target: ['web', 'es5'],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    library: {
      name: 'ReactErrorOverlay',
      type: 'umd',
    },
    path: path.join(__dirname, './lib'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /iframe-bundle\.js$/,
        use: 'raw-loader',
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, './src'),
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      iframeScript$: path.resolve(__dirname, './lib/iframe-bundle.js'),
    },
    fallback: {
      fs: false,
      path: false,
    },
  },
  optimization: {
    nodeEnv: false,
  },
  performance: {
    hints: false,
  },
};
