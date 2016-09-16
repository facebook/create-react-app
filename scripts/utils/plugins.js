// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

var relayPlugin = require('../../plugins/relay');

var start = function() {
    return Promise.all([
        (relayPlugin.isEnabled()) ? relayPlugin.start() : false,
    ])
}

var build = function() {
    return Promise.all([
        (relayPlugin.isEnabled()) ? relayPlugin.build() : false,
    ])
}

module.exports = {
    start: start,
    build: build,
}
