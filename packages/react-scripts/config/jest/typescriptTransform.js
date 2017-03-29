// Copyright 2004-present Facebook. All Rights Reserved.

const fs = require('fs');
const tsc = require('typescript');
const tsconfigPath = require('app-root-path').resolve('/tsconfig.json');

let compilerConfig = {
  module: tsc.ModuleKind.CommonJS,
  jsx: tsc.JsxEmit.React,
}

if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = require(tsconfigPath);

    if (tsconfig && tsconfig.compilerOptions) {
      compilerConfig = tsconfig.compilerOptions;
    }
  } catch (e) { /* Do nothing - default is set */ }
}

module.exports = {
  process(src, path) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      return tsc.transpile(
        src,
        compilerConfig,
        path, []
      );
    }
    return src;
  },
};
