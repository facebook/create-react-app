// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

module.exports = function createDevelopmentNodeBuiltinFallback(nodeModuleName) {
  const linkToDocumentation =
    'https://create-react-app.dev/docs/nodejs-builtin-fallbacks';
  const defaultMessage = `(dev) Error: Module "${nodeModuleName}" not found, ref: ${linkToDocumentation}`;

  const defaultExport = {
    $$typeof: defaultMessage,
    __esModule: {
      value: true,
    },
  };
  try {
    // Modern browsers with Proxy support - Shows warning in $$type, default and specific imports
    return new Proxy(Object.assign({}, defaultExport), {
      get: function developmentFallback(target, prop) {
        if (['$$typeof', '__esModule'].includes(prop)) {
          return target;
        }

        console.error(
          `(dev) Error: Module "${nodeModuleName}" not found, cannot access property "${prop}", please read ${linkToDocumentation}`
        );
        throw TypeError();
      },
    });
  } catch (error) {
    // Legacy browsers without Proxy support - Limited to showing warnings in $$type and default
    const result = Object.assign({}, defaultExport);

    Object.defineProperty(result, 'default', {
      get: function () {
        console.error(defaultMessage);
        throw new TypeError();
      },
    });

    return result;
  }
};
