// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';
const createSwcConfig = require('./createSwcConfig');
const paths = require('../../../paths');

module.exports = ({
  shouldUseSourceMap,
  isEnvDevelopment,
  isEnvProduction,
  shouldUseReactRefresh,
}) => {
  const swcConfig = createSwcConfig({
    shouldUseSourceMap,
    isEnvDevelopment,
    isEnvProduction,
    shouldUseReactRefresh,
  });

  return [
    {
      test: /\.(js|mjs|jsx)$/,
      include: paths.appSrc,
      loader: require.resolve('swc-loader'),
      options: swcConfig.ecmascript,
    },
    {
      test: /\.(ts|tsx)$/,
      include: paths.appSrc,
      loader: require.resolve('swc-loader'),
      options: swcConfig.typescript,
    },
    // Process any JS outside of the app with swc.
    // Unlike the application JS, we only compile the standard ES features.
    {
      test: /\.(js|mjs)$/,
      loader: require.resolve('swc-loader'),
    },
  ];
};
