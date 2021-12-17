// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

module.exports = new Proxy(
  {},
  {
    get: function developmentFallback(target, prop) {
      if (['$$typeof', '__esModule'].includes(prop)) {
        return target;
      }

      console.error(
        `Error: Trying to access property "${prop}" of fallback module for NodeJS builtin module please read https://create-react-app.dev/docs/nodejs-builtin-fallbacks`
      );
      return false;
    },
  }
);
