'use strict';
const webpack = require('webpack');
const paths = require('./paths');
const path = require('path');
const getClientEnvironment = require('./env');
const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);
const isProduction = process.env.NODE_ENV === 'production';

module.exports = dllHash => {
  const dllGlobalName = '[name]' + dllHash.replace(/\./g, '');
  return {
    cache: true,
    entry: [require.resolve('./polyfills'), paths.dllSrc],
    devtool: 'source-map',
    output: {
      filename: dllHash + '.js',
      path: paths.dllPath,
      library: dllGlobalName,
    },
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebookincubator/create-react-app/issues/253
      modules: ['node_modules'].concat(paths.appNodeModules),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      extensions: ['.js', '.json', '.jsx'],
      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
      },
    },
    // @remove-on-eject-begin
    // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
    // directory of `react-scripts` itself rather than the project directory.
    resolveLoader: {
      modules: [
        paths.ownNodeModules,
        // Lerna hoists everything, so we need to look in our app directory
        paths.appNodeModules,
      ],
    },
    // @remove-on-eject-end
    plugins: [
      new webpack.DllPlugin({
        // The path to the manifest file which maps between
        // modules included in a bundle and the internal IDs
        // within that bundle
        path: path.join(paths.dllPath, dllHash + '.json'),
        // The name of the global variable which the library's
        // require function has been assigned to. This must match the
        // output.library option above
        name: dllGlobalName,
      }),
      isProduction ? new webpack.DefinePlugin(env.stringified) : null,
      isProduction
        ? new webpack.optimize.UglifyJsPlugin({
            compress: {
              screw_ie8: true, // React doesn't support IE8
              warnings: false,
            },
            mangle: {
              screw_ie8: true,
            },
            output: {
              comments: false,
              screw_ie8: true,
            },
            sourceMap: true,
          })
        : null,
    ].filter(Boolean),
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
  };
};
