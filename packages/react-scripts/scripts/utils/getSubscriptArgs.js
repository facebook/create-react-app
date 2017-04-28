/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var debugArgs = require('../utils/debugArgs');

module.exports = function getSubscriptArgs(scriptFilename) {
  var args = process.argv.slice(3);
  var passedDebugArgs;
  var nonDebugArgs;
  args.unshift(scriptFilename);
  passedDebugArgs = debugArgs.getFrom(args);
  if (passedDebugArgs) {
    process.env.REACT_APP_DEBUG_JEST = 'true'; // :eyes: side-effect
    nonDebugArgs = debugArgs.removeFrom(args);
    args = passedDebugArgs.concat(nonDebugArgs);
  }
  return args;
};
