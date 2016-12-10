const ExtractTextPlugin = require('extract-text-webpack-plugin');

const tsLoader = {
  test: /\.tsx?$/,
  loader: 'ts-loader'
};

const jsonLoader = {
  test: /\.json$/,
  loader: 'json-loader',
};

const cssLoader = {
  test: /\.css$/,
  loaders: ['style-loader', 'css-loader'],
};

const cssExtractTextLoader = {
  test: /\.css$/,
  loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
};

const tslintLoader = {
  test: /\.tsx?$/,
  loader: 'tslint',
};

const imagesLoader = {
  test: /\.(jpe?g|png|gif)$/i,
  loader: 'url?name=images/[hash].[ext]',
};

const inlineSvgLoader = {
  test: /\.svg$/,
  loader: 'svg-inline'
};

module.exports = {
  tsLoader,
  jsonLoader,
  cssLoader,
  cssExtractTextLoader,
  tslintLoader,
  imagesLoader,
  inlineSvgLoader,
}
