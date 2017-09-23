var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, './lib'),
    filename: 'index.js',
    library: 'ReactErrorOverlay',
    libraryTarget: 'umd',
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
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      iframeScript$: path.resolve(__dirname, './lib/iframe-bundle.js'),
    },
  },
};
