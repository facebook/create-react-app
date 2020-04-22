// Reference: part of the configurations are from
// https://cesium.com/docs/tutorials/cesium-and-webpack/

'use strict';
const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const tsImportPluginFactory = require('ts-import-plugin');

const DEV = process.env.NODE_ENV === 'development';

module.exports = {
	context: __dirname,
	entry: DEV
		? {
			app: [
				'react-hot-loader/patch',
				'webpack-dev-server/client?http://localhost:3002',
				path.resolve(__dirname, '..', 'src/boot-client.tsx'),
			],
		}
		: {
			app: path.resolve(__dirname, '..', 'src/boot-client.tsx'),
		},
	mode: DEV ? 'development' : 'production',

	resolve: {
		alias: {
			'src': path.resolve(__dirname, '..', 'src')
		},
		// Add '.ts' and '.tsx' as resolvable extensions.
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
	},
	output: {
		path: path.resolve(__dirname, '..', 'wwwroot/dist'),
		filename: 'app.bundle.js',
		publicPath: DEV ? '/' : process.env.PUBLIC_URL || '',
	},
	amd: {
		// toUrlUndefined: true,
	},
	node: {
		// Resolve node module use of fs
		fs: 'empty',
	},

	// Enable sourcemaps for debugging webpack's output.
	devtool: DEV ? 'inline-eval-cheap-source-map' : 'source-map',

	externals: {},
	optimization: {
		splitChunks: {
			chunks: 'all',
			name: true,
			cacheGroups: {
				vendors: {
					enforce: true,
					test: /node_modules/,
					name: 'vendor',
					filename: DEV ? '[name].bundle.js' : '[name].[hash].js',
					priority: -10,
				},
			},
		},
	},

	module: {
		rules: [
			{
				test: /\.(png|gif|jpg|jpeg|xml|json)$/,
				exclude: [/node_modules\/proj4/, /node_modules\/antd/],
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'static/img/[name].[hash:7].[ext]'
				}
			},
			{
				test: /\.scss$/,
				exclude: [/node_modules/],
				oneOf: [
					{
						test: /\.module\.scss$/,
						use: [
							MiniCssExtractPlugin.loader,
							{
								loader: 'css-loader',
								options: {
									modules: {
										localIdentName: '[path][name]__[local]--[hash:base64:5]',
									},
									sourceMap: DEV,
								},
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: DEV,
								},
							},
						],
					},
					{
						use: [
							MiniCssExtractPlugin.loader,
							{
								loader: 'css-loader',
								options: {
									sourceMap: DEV,
								},
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: DEV,
								},
							},
						],
					},
				],
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: 'fonts/',
						},
					},
				],
			},
			{
				test: /\.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							silent: true,
							transpileOnly: DEV ? false : true,
							getCustomTransformers: () => ({
								before: [
									tsImportPluginFactory({
										libraryName: 'antd',
										libraryDirectory: 'lib',
										style: 'css',
									}),
								],
							}),
						},
					},
				],
			},
			{
				test: /\.svg$/,
				use: ['svg-react-loader'],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '..', 'wwwroot/template.html'),
			inject: true,
			PUBLIC_URL: process.env.PUBLIC_URL,
		}),
		new CopyWebpackPlugin([
			{
				from: path.resolve(__dirname, '..', `src/images`),
				to: 'images',
				writeToDisk: true,
			},
		]),
		new WriteFilePlugin(),
	],
};
