/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var webpack = require('webpack');
var paths = require('./paths');

module.exports = {
  devtool: 'eval',
  target: 'node',
  entry: paths.testEntry,
  output: {
    path: paths.appTmp,
    pathinfo: true,
    filename: 'testBundle.js',
  },
  resolve: {
    extensions: ['', '.js'],
  },
  resolveLoader: {
    root: paths.ownNodeModules,
    moduleTemplates: ['*-loader']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: paths.appSrc,
        loader: 'babel',
        query: require('./babel.dev')
      },
      {
        test: /\.css$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'null'
      },
      {
        test: /\.json$/,
        // include: [paths.appSrc, paths.appNodeModules],
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'file',
      },
      {
        test: /\.(mp4|webm)$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'url?limit=10000'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"test"' }),
    // cheerio uses an implicit require('./package') that webpack doesn't understand
    // https://github.com/cheeriojs/cheerio/issues/836
    new webpack.NormalModuleReplacementPlugin(/^\.\/package$/, function(result) {
      if(/cheerio/.test(result.context)) {
        result.request = "./package.json"
      }
    })
  ],
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
