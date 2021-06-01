//@ts-check
'use strict';

const GenerateAssetModulesOnPreBuild = require('./GenerateAssetModulesOnPreBuild');

const svgo = {
  plugins: [{ removeViewBox: false }]
};

/**
 * Enables webpack to resolve image files like jpg, png, svg
 * Depending on the file size, it either embeds them as data URLs in JS bundle
 * or works like "file" loader for bigger images
 * @param {{ useCacheLoader?: boolean }} options
 * @return {import("webpack").RuleSetRule}
 */
function imageLoader({ useCacheLoader } = { useCacheLoader: false }) {
  // "url" loader works like "file" loader except that it embeds assets
  // smaller than specified limit in bytes as data URLs to avoid requests.
  // A missing `test` is equivalent to a match.

  const additionalLoaders = [];
  if (useCacheLoader) {
    additionalLoaders.push({ loader: require.resolve('cache-loader') });
  }

  return {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
    oneOf: [
      {
        resource: /\.icon\.svg$/,
        use: [
          ...additionalLoaders,
          {
            loader: require.resolve('svg-sprite-loader')
          },
          {
            loader: require.resolve('svgo-loader'),
            options: svgo
          }
        ]
      },
      {
        resource: /\.svg$/,
        use: [
          ...additionalLoaders,
          {
            loader: require.resolve('svg-url-loader'),
            options: {
              limit: 10000,
              iesafe: true
            }
          },
          {
            loader: require.resolve('svgo-loader'),
            options: svgo
          }
        ]
      },
      {
        use: [
          ...additionalLoaders,
          {
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
        ]
      }
    ]
  };
}

function assetPlugins() {
  return [new GenerateAssetModulesOnPreBuild()];
}

module.exports = {
  imageLoader,
  assetPlugins
};
