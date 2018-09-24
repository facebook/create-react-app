/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const crypto = require('crypto');

module.exports = {
  config(config, { source }) {
    if (source.indexOf('.macro') !== -1 || source.indexOf('/macro') !== -1) {
      return {
        ...config.options,
        cacheBustingKey: crypto.randomBytes(32).toString('hex'),
      };
    }
    return config.options;
  },
};
