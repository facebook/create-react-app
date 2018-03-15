/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

module.exports = function createServeAppMiddleware(servedPathPathname) {
  return function serveAppMiddleware(req, res, next) {
    if (servedPathPathname.length > 1 && servedPathPathname !== './') {
      if (req.url.indexOf(servedPathPathname) === -1) {
        res.redirect(servedPathPathname);
      } else {
        next();
      }
    } else {
      next();
    }
  };
};
