// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// This code is copied from https://github.com/arcanis/jest-pnp-resolver because they haven't
// released a version that works with jest 24 yet. Once they release it, this file should be
// deleted and the `jest-pnp-resolver` dependency updated.

let pnp;

try {
  pnp = require(`pnpapi`);
} catch (error) {
  // not in PnP; not a problem
}

if (pnp) {
  module.exports = (request, { basedir, extensions }) => {
    const resolution = pnp.resolveRequest(request, `${basedir}/`, {
      extensions,
    });

    // When the request is a native module, Jest expects to get the string back unmodified, but pnp returns null instead.
    if (resolution === null) {
      return request;
    }

    return resolution;
  };
} else {
  try {
    module.exports = require(`jest-resolve/build/defaultResolver`).default;
  } catch (error) {
    module.exports = require(`jest-resolve/build/default_resolver`).default;
  }
}
