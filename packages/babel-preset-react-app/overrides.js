/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const crypto = require('crypto');

module.exports = {
  // This function transforms the Babel configuration on a per-file basis
  config(config, { source }) {
    // Babel Macros are notoriously hard to cache, so they shouldn't be
    // https://github.com/babel/babel/issues/8497
    // We naively detect macros using their package suffix and insert a random
    // caller name, a valid option accepted by Babel, to compose a one-time
    // cacheIdentifier for the file. We cannot tune the loader options on a per
    // file basis.
    if (source.indexOf('.macro') !== -1 || source.indexOf('/macro') !== -1) {
      return {
        ...config.options,
        caller: {
          name: `babel-preset-react-app:${crypto
            .randomBytes(32)
            .toString('hex')}`,
        },
      };
    }
    return config.options;
  },
};
