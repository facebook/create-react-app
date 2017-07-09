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

module.exports = applyPlugins;
