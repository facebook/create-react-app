// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

const babelJest = require('babel-jest');

// After Eject
module.exports = babelJest.createTransformer();

// @remove-on-eject-begin
// Before Eject
const babelDev = require('../babel.dev')(true);
module.exports = babelJest.createTransformer(babelDev);
// @remove-on-eject-end
