/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
const SHORTCUT_ESCAPE = 'SHORTCUT_ESCAPE',
  SHORTCUT_LEFT = 'SHORTCUT_LEFT',
  SHORTCUT_RIGHT = 'SHORTCUT_RIGHT';

let boundKeyHandler = null;

type ShortcutCallback = (type: string) => void;

function keyHandler(callback: ShortcutCallback, e: KeyboardEvent) {
  const { key, keyCode, which } = e;
  if (key === 'Escape' || keyCode === 27 || which === 27) {
    callback(SHORTCUT_ESCAPE);
  } else if (key === 'ArrowLeft' || keyCode === 37 || which === 37) {
    callback(SHORTCUT_LEFT);
  } else if (key === 'ArrowRight' || keyCode === 39 || which === 39) {
    callback(SHORTCUT_RIGHT);
  }
}

function registerShortcuts(target: EventTarget, callback: ShortcutCallback) {
  if (boundKeyHandler !== null) {
    return;
  }
  boundKeyHandler = keyHandler.bind(undefined, callback);
  target.addEventListener('keydown', boundKeyHandler);
}

function unregisterShortcuts(target: EventTarget) {
  if (boundKeyHandler === null) {
    return;
  }
  target.removeEventListener('keydown', boundKeyHandler);
  boundKeyHandler = null;
}

export {
  SHORTCUT_ESCAPE,
  SHORTCUT_LEFT,
  SHORTCUT_RIGHT,
  registerShortcuts as register,
  unregisterShortcuts as unregister,
  keyHandler as handler,
};
