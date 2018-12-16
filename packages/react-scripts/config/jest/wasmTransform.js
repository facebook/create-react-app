// @remove-on-eject-begin
/**
 * Copyright (c) 2018-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');

// This is a custom Jest transformer for WASM imports.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    return `
    const fs = require('fs');
    const buffer = fs.readFileSync(${assetFilename});
    const module = new WebAssembly.Module(buffer);
    const instance = new WebAssembly.Instance(module);
    
    module.exports = {
      __esmodule: true,
      default: instance.exports,
    }`;
  },
};
