'use strict';
const webpack = require('webpack');
const paths = require('./paths');
const path = require('path');
const getClientEnvironment = require('./env');
const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);
const isProduction = process.env.NODE_ENV === 'production';

module.exports = vendorHash => {
  const vendorGlobalName = '[name]' + vendorHash.replace(/\./g, '');
  return {
    cache: true,
    entry: (isProduction
      ? [
          require.resolve('./polyfills'), // In production, we only want to load the polyfills and the app code.
        ]
      : [
          // Include an alternative client for WebpackDevServer. A client's job is to
          // connect to WebpackDevServer by a socket and get notified about changes.
          // When you save a file, the client will either apply hot updates (in case
          // of CSS changes), or refresh the page (in case of JS changes). When you
          // make a syntax error, this client will display a syntax error overlay.
          // Note: instead of the default WebpackDevServer client, we use a custom one
          // to bring better experience for Create React App users. You can replace
          // the line below with these two lines if you prefer the stock client:
          // require.resolve('webpack-dev-server/client') + '?/',
          // require.resolve('webpack/hot/dev-server'),
          require.resolve('react-dev-utils/webpackHotDevClient'),
          // We ship a few polyfills by default:
          require.resolve('./polyfills'),
          // Errors should be considered fatal in development
          require.resolve('react-error-overlay'),
        ]).concat(paths.vendorSrc),
    devtool: 'source-map',
    output: {
      filename: vendorHash + '.js',
      path: paths.vendorPath,
      library: vendorGlobalName,
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
        path: path.join(paths.vendorPath, vendorHash + '.json'),
        // The name of the global variable which the library's
        // require function has been assigned to. This must match the
        // output.library option above
        name: vendorGlobalName,
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
