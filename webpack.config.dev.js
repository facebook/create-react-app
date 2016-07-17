/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var path = require('path');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..')));
var relative = isInNodeModules ? '../..' : '.';

module.exports = {
  devtool: 'eval',
  entry: [
    './src/index.js',
    'webpack-dev-server/client?http://localhost:3000'
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: path.join(__dirname, relative, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: path.resolve(__dirname, relative, 'src'),
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, relative, 'src'),
        loader: 'babel',
        query: {
          cacheDirectory: true,
          presets: ['es2015', 'es2016', 'react'],
          plugins: ['transform-object-rest-spread']
        }
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, relative, 'src'),
        loader: 'style!css!postcss'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file',
      },
      {
        test: /\.(mp4|webm)$/,
        loader: 'url?limit=10000'
      }
    ]
  },
  eslint: {
    configFile: path.join(__dirname, '.eslintrc')
  },
  postcss: function() {
    return [autoprefixer];
  },
  plugins: [
    // TODO: infer from package.json?
    new HtmlWebpackPlugin({ title: 'My React Project' }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' })
  ]
};
