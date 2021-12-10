// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';
const hasJsxRuntime = require('./hasJsxRuntime');

module.exports = function createSwcConfig({
  shouldUseSourceMap = true,
  isEnvDevelopment = false,
  isEnvProduction = false,
  shouldUseReactRefresh = false,
} = {}) {
  const env =
    isEnvDevelopment | isEnvProduction
      ? {
          mode: 'entry',
          coreJs: 3,
        }
      : {};
  return {
    ecmascript: {
      sourceMaps: shouldUseSourceMap,
      jsc: {
        externalHelpers: true,
        parser: {
          jsx: true,
          syntax: 'ecmascript',
        },
        transform: {
          react: {
            runtime: hasJsxRuntime ? 'automatic' : 'clasic',
            refresh: shouldUseReactRefresh,
            development: isEnvDevelopment,
          },
        },
      },
      env,
    },
    typescript: {
      sourceMaps: shouldUseSourceMap,
      jsc: {
        externalHelpers: true,
        parser: {
          tsx: true,
          syntax: 'typescript',
          development: isEnvDevelopment,
        },
        transform: {
          react: {
            runtime: hasJsxRuntime ? 'automatic' : 'clasic',
            refresh: shouldUseReactRefresh,
            development: isEnvDevelopment,
          },
        },
      },
    },
    env,
  };
};
