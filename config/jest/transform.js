// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

const babelDev = require('../babel.dev');
const babelJest = require('babel-jest');
const tsc = require('typescript');
const babelTransformer = babelJest.createTransformer(babelDev);

// transpile the source with TypeScript, if needed, and then with Babel
module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      src = tsc.transpile(
        src,
        {
          module: tsc.ModuleKind.CommonJS,
          jsx: tsc.JsxEmit.React,
        },
        path,
        []
      );
    }
    return babelTransformer.process(src, path);
  },
};
