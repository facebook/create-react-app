/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */

type ReactFrame = {
  fileName: string | null,
  lineNumber: number | null,
  name: string | null,
};
const reactFrameStack: Array<ReactFrame[]> = [];

export type { ReactFrame };

// This is a stripped down barebones version of this proposal:
// https://gist.github.com/sebmarkbage/bdefa100f19345229d526d0fdd22830f
// We're implementing just enough to get the invalid element type warnings
// to display the component stack in React 15.6+:
// https://github.com/facebook/react/pull/9679
/// TODO: a more comprehensive implementation.

const registerReactStack = () => {
  if (typeof console !== 'undefined') {
    // $FlowFixMe
    console.reactStack = frames => reactFrameStack.push(frames);
    // $FlowFixMe
    console.reactStackEnd = frames => reactFrameStack.pop();
  }
};

const unregisterReactStack = () => {
  if (typeof console !== 'undefined') {
    // $FlowFixMe
    console.reactStack = undefined;
    // $FlowFixMe
    console.reactStackEnd = undefined;
  }
};

type ConsoleProxyCallback = (message: string, frames: ReactFrame[]) => void;
const permanentRegister = function proxyConsole(
  type: string,
  callback: ConsoleProxyCallback
) {
  if (typeof console !== 'undefined') {
    const orig = console[type];
    if (typeof orig === 'function') {
      console[type] = function __stack_frame_overlay_proxy_console__() {
        try {
          const message = arguments[0];
          if (typeof message === 'string' && reactFrameStack.length > 0) {
            callback(message, reactFrameStack[reactFrameStack.length - 1]);
          }
        } catch (err) {
          // Warnings must never crash. Rethrow with a clean stack.
          setTimeout(function() {
            throw err;
          });
        }
        return orig.apply(this, arguments);
      };
    }
  }
};

export { permanentRegister, registerReactStack, unregisterReactStack };
