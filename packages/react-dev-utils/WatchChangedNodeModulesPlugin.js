/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// This Webpack plugin ensures that any change in node_modules package.json forces a project rebuild.

'use strict';

var fs = require('fs');

var timeout;

class WatchChangedNodeModulesPlugin {
  constructor(nodeModulesPath) {
    this.nodeModulesPath = nodeModulesPath;
  }

  apply(compiler) {
    fs.watch(
      this.nodeModulesPath,
      { persistent: false, recursive: true },
      () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => compiler.run(() => {}), 1000);
      }
    );
  }
}

module.exports = WatchChangedNodeModulesPlugin;
