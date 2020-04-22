'use strict';
const path = require('path');

const baseWebpackConfig = require('./webpack.base.conf');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');

const webpackConfig = merge(baseWebpackConfig, {
	mode: 'production',
	output: {
		path: path.resolve(__dirname, '..', 'wwwroot/dist'),
		filename: 'static/js/app.bundle.[hash].js',
		chunkFilename: 'static/js/[id].[chunkhash].js',
		publicPath: process.env.PUBLIC_URL || '',
	},
	plugins: [
		...baseWebpackConfig.plugins,
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].[hash].css',
			chunkFilename: 'static/css/[id].[chunkhash].css',
		}),
	],
	optimization: {
		splitChunks: {
			chunks: 'all',
			name: true,
			cacheGroups: {
				vendors: {
					enforce: true,
					test: /node_modules/,
					name: 'vendor',
					filename: 'static/js/[name].[hash].js',
					priority: -10,
				},
			},
		},
	},
});

module.exports = webpackConfig;
