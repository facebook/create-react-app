// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';
const babelJest = require('babel-jest');
const paths = require('../paths');

const babelTransformer = babelJest.createTransformer({
  presets: [require.resolve('babel-preset-react-app')],
  babelrc: false,
});

// choose files to transpile
// jest < 22.0.x transform patterns don't resolve symlinks, ie. don't match against realpaths
// jest >= 22.0.04 matches against realpaths, but this method might be preferable anyway
const babelProcess = babelTransformer.process;
babelTransformer.process = (src, filename, config, transformOptions) => {
  if (paths.shouldTranspile(filename)) {
    return babelProcess(src, filename, config, transformOptions);
  }
  return src;
};

module.exports = babelTransformer;
