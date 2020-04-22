/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  self.Promise = require('promise/lib/es6-extensions.js');
}

// Make sure we're in a Browser-like environment before importing polyfills
// This prevents `fetch()` from being imported in a Node test environment
if (typeof window !== 'undefined') {
  // fetch() polyfill for making API calls.
  require('whatwg-fetch');
}

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// Support for...of (a commonly used syntax feature that requires Symbols)
require('core-js/features/symbol');
// Support iterable spread (...Set, ...Map)
require('core-js/features/array/from');
