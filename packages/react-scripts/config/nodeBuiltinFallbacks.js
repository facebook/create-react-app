// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const paths = require('./paths');

const builtinFallbackMap = {
  // Reference: https://github.com/webpack/webpack/blob/c181294865dca01b28e6e316636fef5f2aad4eb6/lib/ModuleNotFoundError.js#L13
  assert: 'assert/',
  buffer: 'buffer/',
  console: 'console-browserify',
  constants: 'constants-browserify',
  crypto: 'crypto-browserify',
  domain: 'domain-browser',
  events: 'events/',
  http: 'stream-http',
  https: 'https-browserify',
  os: 'os-browserify/browser',
  path: 'path-browserify',
  punycode: 'punycode/',
  process: 'process/browser',
  querystring: 'querystring-es3',
  stream: 'stream-browserify',
  _stream_duplex: 'readable-stream/duplex',
  _stream_passthrough: 'readable-stream/passthrough',
  _stream_readable: 'readable-stream/readable',
  _stream_transform: 'readable-stream/transform',
  _stream_writable: 'readable-stream/writable',
  string_decoder: 'string_decoder/',
  sys: 'util/',
  timers: 'timers-browserify',
  tty: 'tty-browserify',
  url: 'url/',
  util: 'util/',
  vm: 'vm-browserify',
  zlib: 'browserify-zlib',
};

function createNodeBuiltinFallbacks(webpackEnv) {
  const fallbacks = {};
  const isEnvProduction = webpackEnv === 'production';

  const appPackageJson = require(paths.appPackageJson);

  for (const [nodeModule, fallbackModule] of Object.entries(
    builtinFallbackMap
  )) {
    const [fallbackModuleName] = fallbackModule.split('/');
    fallbacks[nodeModule] = isEnvProduction
      ? false // Default don't include polyfills per default in production
      : require.resolve('./defaultNodeBuiltinFallback'); // Default polyfill in development for better DX

    if (appPackageJson.dependencies[fallbackModuleName]) {
      // Check app package.json for fallback dependency making sure we use project installed fallbacks
      try {
        // Use installed fallback
        fallbacks[nodeModule] = require.resolve(fallbackModule);
      } catch (e) {
        // If ever fallback resolve failed
        console.error(
          `Failed to load fallback module "${fallbackModule}" for "${nodeModule}"`
        );
      }
    }
  }

  return {
    fallbacks,
    fallbackEntries: Object.values(fallbacks),
  };
}

module.exports = createNodeBuiltinFallbacks;
