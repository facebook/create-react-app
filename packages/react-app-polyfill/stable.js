/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Polyfill stable language features.
// It's recommended to use @babel/preset-env and browserslist
// to only include the polyfills necessary for the target browsers.
require('core-js/stable');
require('regenerator-runtime/runtime');
