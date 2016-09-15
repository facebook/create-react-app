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

var paths = require('../paths');

/**
 * relay requires 'react-relay' install and in package.json, GRAPHQL_URL env variable set to retrieve local copy of schema.json resulting from `npm run fetchRelaySchema`
 */
var relayIsEnabled = function() {
    var appPackageJson = require(paths.appPackageJson);
    if (appPackageJson && appPackageJson.dependencies && appPackageJson.dependencies['react-relay']) {

        if (!process.env.REACT_APP_GRAPHQL_URL) {
            throw new Error("Relay requires a url to your graphql server\nSpecifiy this in a REACT_APP_GRAPHQL_URL environment variable.\n\n");
        }

        // FIXME
        if (!paths.relaySchema) {
            throw new Error("babel-relay-plugin requires a local copy of your graphql schema\nRun 'npm run fetchRelaySchema' to fetch it from the GRAPHQL_URL environment variable.\n\n");
        }

        return true;
    }

    return false
}

module.exports = {
    relayIsEnabled: relayIsEnabled,
};
