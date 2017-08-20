/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
let stackTraceRegistered: boolean = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
let restoreStackTraceValue: number = 10;

const MAX_STACK_LENGTH: number = 50;

function registerStackTraceLimit(limit: number = MAX_STACK_LENGTH) {
  if (stackTraceRegistered) {
    return;
  }
  try {
    restoreStackTraceValue = Error.stackTraceLimit;
    Error.stackTraceLimit = limit;
    stackTraceRegistered = true;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

function unregisterStackTraceLimit() {
  if (!stackTraceRegistered) {
    return;
  }
  try {
    Error.stackTraceLimit = restoreStackTraceValue;
    stackTraceRegistered = false;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

export {
  registerStackTraceLimit as register,
  unregisterStackTraceLimit as unregister,
};
