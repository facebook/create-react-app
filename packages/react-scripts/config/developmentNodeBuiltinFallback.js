// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const linkToDocumentation =
  'https://create-react-app.dev/docs/nodejs-builtin-fallbacks';
const defaultMessage = `(development mode) Error: Trying to access fallback module for NodeJS builtin module please read ${linkToDocumentation}`;

const defaultExport = {
  $$typeof: defaultMessage,
  __esModule: {
    value: true,
  },
};
try {
  // Modern browsers with Proxy support - Shows warning in $$type, default and specific imports
  module.exports = new Proxy(
    { ...defaultExport },
    {
      get: function developmentFallback(target, prop) {
        if (['$$typeof', '__esModule'].includes(prop)) {
          return target;
        }

        console.error(
          `(development mode) Error: Trying to access property "${prop}" of fallback module for NodeJS builtin module please read ${linkToDocumentation}`
        );
        throw TypeError();
      },
    }
  );
} catch (error) {
  // Legacy browsers without Proxy support - Limited to showing warnings in $$type and default
  module.exports = {
    ...defaultExport,
  };

  Object.defineProperty(module.exports, 'default', {
    get: function () {
      console.error(defaultMessage);
      throw new TypeError();
    },
  });
}
