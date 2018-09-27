// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const babelJest = require('babel-jest');

const isDependency = filename => filename.indexOf('/node_modules/') !== -1;

const transformer = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-react-app')],
  babelrc: false,
  configFile: false,
});
const dependenciesTransformer = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-react-app/dependencies')],
  babelrc: false,
  configFile: false,
});

module.exports = {
  canInstrument: true,
  getCacheKey(fileData, filename, configString, options) {
    if (isDependency(filename)) {
      return dependenciesTransformer.getCacheKey(
        fileData,
        filename,
        configString,
        options
      );
    }
    return transformer.getCacheKey(fileData, filename, configString, options);
  },
  process(src, filename, config, transformOptions) {
    if (isDependency(filename)) {
      return dependenciesTransformer.process(
        src,
        filename,
        config,
        transformOptions
      );
    }
    return transformer.process(src, filename, config, transformOptions);
  },
};
