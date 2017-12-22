// @remove-file-on-eject
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict'

const babelJest = require('babel-jest')

module.exports = babelJest.createTransformer({
  'plugins': [
    'transform-es2015-modules-commonjs',
    'transform-decorators-legacy',
    'transform-class-properties',
    ['module-resolver', {
      'root': ['.'],
      'alias': {
        'example': './example',
        'src': './src'
      }
    }]
  ],
  'presets': [
    'react-app',
    'es2015'
  ],
  babelrc: false,
})
