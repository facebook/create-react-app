/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
