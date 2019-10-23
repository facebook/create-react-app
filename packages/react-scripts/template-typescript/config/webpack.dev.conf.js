'use strict';
const path = require('path');

const baseConfig = require('./webpack.base.conf');

module.exports = {
  ...baseConfig,
  devServer: {
    contentBase: path.join(__dirname, '..', 'wwwroot/dist/'),
    compress: true,
    historyApiFallback: true,
    hot: true,
    port: 3002,
  },
};
