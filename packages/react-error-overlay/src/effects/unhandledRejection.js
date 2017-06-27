/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
let boundRejectionHandler = null;

type ErrorCallback = (error: Error) => void;

function rejectionHandler(
  callback: ErrorCallback,
  e: PromiseRejectionEvent
): void {
  if (e == null || e.reason == null) {
    return callback(new Error('Unknown'));
  }
  let { reason } = e;
  if (reason instanceof Error) {
    return callback(reason);
  }
  // A non-error was rejected, we don't have a trace :(
  // Look in your browser's devtools for more information
  return callback(new Error(reason));
}

function registerUnhandledRejection(
  target: EventTarget,
  callback: ErrorCallback
) {
  if (boundRejectionHandler !== null) {
    return;
  }
  boundRejectionHandler = rejectionHandler.bind(undefined, callback);
  // $FlowFixMe
  target.addEventListener('unhandledrejection', boundRejectionHandler);
}

function unregisterUnhandledRejection(target: EventTarget) {
  if (boundRejectionHandler === null) {
    return;
  }
  // $FlowFixMe
  target.removeEventListener('unhandledrejection', boundRejectionHandler);
  boundRejectionHandler = null;
}

export {
  registerUnhandledRejection as register,
  unregisterUnhandledRejection as unregister,
};
