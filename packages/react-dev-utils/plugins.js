/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

function applyPlugins(config, plugins, { paths }) {
  const pluginPaths = plugins
    .map(p => {
      try {
        return require.resolve(`react-scripts-plugin-${p}`);
      } catch (e) {
        return null;
      }
    })
    .filter(e => e != null);
  for (const pluginPath of pluginPaths) {
    const { apply } = require(pluginPath);
    config = apply(config, { paths });
  }
  return config;
}

// arr: [[afterExt, strExt1, strExt2, ...], ...]
function pushExtensions(config, arr) {
  const { resolve: { extensions } } = config;

  for (const [after, ...exts] of arr) {
    // Find the extension we want to add after
    const index = extensions.findIndex(s => s === after);
    if (index === -1) {
      throw new Error(`Unable to find extension ${after} in configuration.`);
    }
    // Push the extensions into array in the order we specify
    extensions.splice(index + 1, 0, ...exts);
  }
}

function pushExclusiveLoader(config, testStr, loader) {
  const { module: { rules: [, { oneOf: rules }] } } = config;
  const jsTransformIndex = rules.findIndex(
    rule => rule.test.toString() === '/\\.(js|jsx)$/'
  );
  if (jsTransformIndex === -1) {
    throw new Error('Unable to find babel transform.');
  }
  rules.splice(jsTransformIndex + 1, 0, loader);
}

module.exports = { applyPlugins, pushExtensions, pushExclusiveLoader };
