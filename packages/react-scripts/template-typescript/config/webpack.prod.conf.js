'use strict';
const path = require('path');

const baseWebpackConfig = require('./webpack.base.conf');
const merge = require('webpack-merge');

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
});

module.exports = webpackConfig;
