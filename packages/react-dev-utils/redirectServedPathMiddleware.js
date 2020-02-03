/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const path = require('path');
const { mayProxy } = require('react-dev-utils/WebpackDevServerUtils');

module.exports = function createRedirectServedPathMiddleware(
  servedPath,
  appPublic
) {
  // remove end slash so user can land on `/test` instead of `/test/`
  const servedPathSlashTrimmed = servedPath.slice(0, -1);
  return function redirectServedPathMiddleware(req, res, next) {
    const pathname = new URL(req.url, 'https://stub-domain').pathname;
    if (
      mayProxy(req.method, req.headers.accept, pathname, appPublic, servedPath)
    ) {
      next();
      return;
    }

    if (
      servedPathSlashTrimmed === '' ||
      req.url === servedPathSlashTrimmed ||
      req.url.startsWith(servedPathSlashTrimmed)
    ) {
      next();
    } else {
      const newPath = path.join(
        servedPathSlashTrimmed,
        req.path !== '/' ? req.path : ''
      );
      res.redirect(newPath);
    }
  };
};
