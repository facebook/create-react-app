const postCssOptions = require('../options/postcss-options');
const extractTextPluginOptions = require('../options/extract-text-plugin-options');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

module.exports = (loader, test, exclude, modules) => isDev => {
  let loaders = isDev
    ? [
        {
          loader: require.resolve('style-loader'),
        },
      ]
    : [];

  loaders = loaders.concat([
    {
      loader: require.resolve('css-loader'),
      options: Object.assign(
        { minimize: !isDev, sourceMap: shouldUseSourceMap },
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
      options: Object.assign(
        {},
        { sourceMap: shouldUseSourceMap },
        postCssOptions
      ),
    },
  ]);

  if (loader) {
    loaders.push({
      loader,
      options: {
        sourceMap: shouldUseSourceMap,
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
