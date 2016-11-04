/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const babelJest = require('babel-jest');
const tsc = require('typescript');

const babelTransformer = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-react-app')]
});

// TODO load tsconfig.json in created app instead of duplicating tsconfig.compilerOptions here
const compilerOptions = {
    // Overwrite module
    // Jest gives `SyntaxError: Unexpected token import` error when ES6 module are emitted
    // module: tsc.ModuleKind.ES6,
    module: tsc.ModuleKind.CommonJS,
    // Overwrite jsx
    // Expected Babel transformer to convert jsx to js
    // but Jest gives `SyntaxError: Unexpected token <` error when set to Preserve
    // jsx: tsc.JsxEmit.Preserve,
    jsx: tsc.JsxEmit.React,
    target: tsc.ScriptTarget.ES6,
    moduleResolution: tsc.ModuleResolutionKind.NodeJs,
};

// transpile the source with TypeScript, if needed, and then with Babel
module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      src = tsc.transpile(
        src,
        compilerOptions,
        path,
        []
      );
    }
    return babelTransformer.process(src, path);
  },
};
