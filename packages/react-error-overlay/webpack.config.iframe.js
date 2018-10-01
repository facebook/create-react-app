/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/iframeScript.js',
  output: {
    path: path.join(__dirname, './lib'),
    filename: 'iframe-bundle.js',
  },
  module: {
    rules: [
      {
        oneOf: [
          // Source
          {
            test: /\.js$/,
            include: [path.resolve(__dirname, './src')],
            use: {
              loader: 'babel-loader',
            },
          },
          // Dependencies
          {
            test: /\.js$/,
            exclude: /@babel(?:\/|\\{1,2})runtime/,
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  ['babel-preset-react-app/dependencies', { helpers: true }],
                ],
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      // This code is embedded as a string, so it would never be optimized
      // elsewhere.
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
            comparisons: false,
          },
          output: {
            comments: false,
            ascii_only: false,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // We set process.env.NODE_ENV to 'production' so that React is built
      // in production mode.
      'process.env': { NODE_ENV: '"production"' },
      // This prevents our bundled React from accidentally hijacking devtools.
      __REACT_DEVTOOLS_GLOBAL_HOOK__: '({})',
    }),
  ],
  performance: false,
};
