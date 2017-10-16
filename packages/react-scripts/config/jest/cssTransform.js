// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';

// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/tutorial-webpack.html
const path = require('path');


module.exports = {
  process(src, filename, config, options) {
    return `
    
/* eslint-disable no-var, comma-dangle */
var Reflect; // eslint-disable-line no-unused-vars
var idObj;

function checkIsNodeV6OrAbove() {
  if (typeof process === 'undefined') {
    return false;
  }

  return parseInt(process.versions.node.split('.')[0], 10) >= 6;
}

if (!checkIsNodeV6OrAbove()) {
  Reflect = require('harmony-reflect'); // eslint-disable-line global-require
}

idObj = new Proxy({}, {
  get: function getter(target, key) {
    if (key === '__esModule') {
      return false;
    }
    return '${path.basename(filename).split('.')[0]}__' + key;
  }
});

module.exports = idObj;

    `
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};
