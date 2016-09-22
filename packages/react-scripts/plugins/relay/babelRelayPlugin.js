// @remove-on-eject-begin
/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @relay
 */
// @remove-on-eject-end

var paths = require('../../config/paths');
var getbabelRelayPlugin = require('babel-relay-plugin');

var schema = require(paths.relaySchema);

module.exports = getbabelRelayPlugin(schema.data);
