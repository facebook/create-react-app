/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const path = require('path');

class ModuleScopePlugin {
  constructor(appSrc) {
    this.appSrc = appSrc;
  }

  apply(resolver) {
    const { appSrc } = this;
    resolver.plugin('file', (request, callback) => {
      // Unknown issuer, probably webpack internals
      if (!request.context.issuer) {
        return callback();
      }
      if (
        // If this resolves to a node_module, we don't care what happens next
        request.descriptionFileRoot.indexOf('/node_modules/') !== -1 ||
        // Make sure this request was manual
        !request.__innerRequest_request
      ) {
        return callback();
      }
      // Resolve the issuer from our appSrc and make sure it's one of our files
      // Maybe an indexOf === 0 would be better?
      const relative = path.relative(appSrc, request.context.issuer);
      // If we go back, not our request!
      if (relative[0] === '.') {
        return callback();
      }
      const requestRelative = path.relative(
        appSrc,
        path.resolve(
          path.dirname(request.context.issuer),
          request.__innerRequest_request
        )
      );
      if (requestRelative[0] === '.') {
        callback(
          new Error(
            `You attempted to require ${request.__innerRequest_request}, which falls outside of src/.`
          ),
          request
        );
      } else {
        callback();
      }
    });
  }
}

module.exports = ModuleScopePlugin;
