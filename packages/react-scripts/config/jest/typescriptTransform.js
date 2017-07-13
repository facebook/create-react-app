// @remove-on-eject-begin
// @remove-file-on-eject typescript
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const paths = require('../paths');
const tsc = (function() {
  try {
    return require('react-scripts-plugin-typescript').tsc;
  } catch (e) {
    return require('typescript');
  }
})();
const THIS_FILE = fs.readFileSync(__filename);

const strictCompilerConfig = {
  module: tsc.ModuleKind.CommonJS,
};

let compilerConfig = Object.assign({}, strictCompilerConfig, {
  jsx: tsc.JsxEmit.React,
});

const tsconfigPath = path.join(paths.appSrc, 'tsconfig.json');

if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = tsc.readConfigFile(tsconfigPath).config;

    if (tsconfig && tsconfig.compilerOptions) {
      compilerConfig = Object.assign(
        {},
        tsconfig.compilerOptions,
        strictCompilerConfig
      );
    }
  } catch (e) {
    /* Do nothing - default is set */
  }
}

module.exports = {
  process(src, path, config, options) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
      let compilerOptions = compilerConfig;
      if (options.instrument) {
        // inline source with source map for remapping coverage
        compilerOptions = Object.assign({}, compilerConfig);
        delete compilerOptions.sourceMap;
        compilerOptions.inlineSourceMap = true;
        compilerOptions.inlineSources = true;
        delete compilerOptions.outDir;
      }

      const tsTranspiled = tsc.transpileModule(src, {
        compilerOptions: compilerOptions,
        fileName: path,
      });
      return tsTranspiled.outputText;
    }
    return src;
  },
  getCacheKey(fileData, filePath, configStr, options) {
    return crypto
      .createHash('md5')
      .update(THIS_FILE)
      .update('\0', 'utf8')
      .update(fileData)
      .update('\0', 'utf8')
      .update(filePath)
      .update('\0', 'utf8')
      .update(configStr)
      .update('\0', 'utf8')
      .update(JSON.stringify(compilerConfig))
      .update('\0', 'utf8')
      .update(options.instrument ? 'instrument' : '')
      .digest('hex');
  },
};
