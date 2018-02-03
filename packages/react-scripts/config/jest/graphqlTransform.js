// @remove-on-eject-begin
/**
 * Copyright (c) 2018-present, Facebook, Inc.
 * Copyright (c) 2016 Remind
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const loader = require('graphql-tag/loader');

module.exports = {
  process(src) {
    return loader.call({ cacheable() {} }, src);
  },
};
