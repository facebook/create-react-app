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
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');

// We are in the development config. This contains development only features.
module.exports = function () {
  return {
    devtool: 'cheap-module-source-map',
    // Note: instead of the default WebpackDevServer client, we use a custom one
    // to bring better experience for Create React App users. You can replace
    // the line below with these two lines if you prefer the stock client:
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server'),
    entry: [
      require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndexJs,
    ],
    output: {
      pathinfo: true,
      filename: 'static/js/bundle.js',
      chunkFilename: 'static/js/[name].chunk.js',
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      new webpack.ProgressPlugin(),
      // See https://github.com/facebook/create-react-app/issues/186
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // See https://github.com/facebook/create-react-app/issues/240
      new CaseSensitivePathsPlugin(),
    ],
  };
};
