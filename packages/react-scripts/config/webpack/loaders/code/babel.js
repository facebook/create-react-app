// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

module.exports = ({
  shouldUseSourceMap,
  isEnvDevelopment,
  isEnvProduction,
  shouldUseReactRefresh,
}) => {
  // @remove-on-eject-begin
  const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
  // @remove-on-eject-end
  const hasJsxRuntime = require('../../../hasJsxRuntime');
  const paths = require('../../../paths');

  return [
    {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: paths.appSrc,
      loader: require.resolve('babel-loader'),
      options: {
        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
        presets: [
          [
            require.resolve('babel-preset-react-app'),
            {
              runtime: hasJsxRuntime ? 'automatic' : 'classic',
            },
          ],
        ],
        // @remove-on-eject-begin
        babelrc: false,
        configFile: false,
        // Make sure we have a unique cache identifier, erring on the
        // side of caution.
        // We remove this when the user ejects because the default
        // is sane and uses Babel options. Instead of options, we use
        // the react-scripts and babel-preset-react-app versions.
        cacheIdentifier: getCacheIdentifier(
          isEnvProduction ? 'production' : isEnvDevelopment && 'development',
          [
            'babel-plugin-named-asset-import',
            'babel-preset-react-app',
            'react-dev-utils',
            'react-scripts',
          ]
        ),
        // @remove-on-eject-end
        plugins: [
          isEnvDevelopment &&
            shouldUseReactRefresh &&
            require.resolve('react-refresh/babel'),
        ].filter(Boolean),
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
        cacheCompression: false,
        compact: isEnvProduction,
      },
    },
    // Process any JS outside of the app with Babel.
    // Unlike the application JS, we only compile the standard ES features.
    {
      test: /\.(js|mjs)$/,
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      loader: require.resolve('babel-loader'),
      options: {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: [
          [
            require.resolve('babel-preset-react-app/dependencies'),
            { helpers: true },
          ],
        ],
        cacheDirectory: true,
        // See #6846 for context on why cacheCompression is disabled
        cacheCompression: false,
        // @remove-on-eject-begin
        cacheIdentifier: getCacheIdentifier(
          isEnvProduction ? 'production' : isEnvDevelopment && 'development',
          [
            'babel-plugin-named-asset-import',
            'babel-preset-react-app',
            'react-dev-utils',
            'react-scripts',
          ]
        ),
        // @remove-on-eject-end
        // Babel sourcemaps are needed for debugging into node_modules
        // code.  Without the options below, debuggers like VSCode
        // show incorrect code and set breakpoints on the wrong lines.
        sourceMaps: shouldUseSourceMap,
        inputSourceMap: shouldUseSourceMap,
      },
    },
  ];
};
