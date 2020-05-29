// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const vm = require('vm');

// TODO: Remove this hack and replace contents of this module with _verifyTypescriptSetup.js.
// The act of require'ing TypeScript causes `globalThis` to be polyfilled on Node 10,
// which causes jsdom 16 to fail. See https://github.com/jsdom/jsdom/issues/2961.
function verifyTypeScriptSetup() {
  vm.runInNewContext('require("./_verifyTypeScriptSetup")()', {
    console,
    require,
  });
}

module.exports = verifyTypeScriptSetup;
