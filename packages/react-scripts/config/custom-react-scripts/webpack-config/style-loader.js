const postCssOptions = require('../postcss-options');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const paths = require('../../paths');
const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const cssFilename = 'static/css/[name].[contenthash:8].css';

const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

module.exports = (loader, test, exclude, modules) => isDev => {
  let loaders = isDev
    ? [
        {
          loader: require.resolve('style-loader'),
          options: { sourceMap: true },
        },
      ]
    : [];

  loaders = loaders.concat([
    {
      loader: require.resolve('css-loader'),
      options: Object.assign(
        {},
        { importLoaders: 1 },
        modules === true
          ? {
              localIdentName: '[sha512:hash:base32]-[name]-[local]',
              modules: true,
            }
          : {}
      ),
    },
    {
      loader: require.resolve('postcss-loader'),
      options: Object.assign({}, { sourceMap: isDev }, postCssOptions),
    },
  ]);

  if (loader) {
    loaders.push({
      loader,
      options: {
        sourceMap: isDev,
      },
    });
  }

  if (isDev) {
    return {
      test,
      exclude,
      use: loaders,
    };
  }

  return {
    test,
    exclude,
    loader: ExtractTextPlugin.extract(
      Object.assign(
        {
          fallback: require.resolve('style-loader'),
          use: loaders,
        },
        extractTextPluginOptions
      )
    ),
  };
};
