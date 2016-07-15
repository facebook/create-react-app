var path = require('path');
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var relative = process.argv[2] === 'local' ? '.' : '../..';

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
        loader: 'eslint-loader',
        include: path.resolve(__dirname, relative, 'src')
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, relative, 'src'),
        loader: 'babel'
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
  postcss: function () {
    return [ autoprefixer ];
  },
  plugins: [
    // TODO: infer from package.json?
    new HtmlWebpackPlugin({ title: 'My React Project' }),
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"development"' })
  ]
};
