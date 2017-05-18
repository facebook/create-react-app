/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const launchEditor = require('react-dev-utils/launchEditor');

module.exports = function createLaunchEditorMiddleware() {
  return function launchEditorMiddleware(req, res, next) {
    // Keep this in sync with react-error-overlay
    if (req.url.startsWith('/__open-stack-frame-in-editor')) {
      launchEditor(req.query.fileName, req.query.lineNumber);
      res.end();
    } else {
      next();
    }
  };
};
