/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

require('./ie11');

// React 16+ relies on Map, Set, and requestAnimationFrame
require('core-js/features/map');
require('core-js/features/set');

require('raf').polyfill();
