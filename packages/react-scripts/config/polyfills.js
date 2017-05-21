// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

if (typeof Promise === 'undefined') {
  // Rejection tracking prevents a common issue where React gets into an
  // inconsistent state due to an error, but it gets swallowed by a Promise,
  // and the user has no idea what causes React's erratic future behavior.
  require('promise/lib/rejection-tracking').enable();
  window.Promise = require('promise/lib/es6-extensions.js');
}

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
if (process.env.NODE_ENV === 'test') {
  require('raf').polyfill(global);
}

// TODO: make this dev-only
// and move to a better place:

let forceUpdateCallbacks = [];
let forceUpdateTimeout = null;
window.__enqueueForceUpdate = function(onSuccess) {
  forceUpdateCallbacks.push(onSuccess);
  if (forceUpdateTimeout) {
    return;
  }
  forceUpdateTimeout = setTimeout(() => {
    forceUpdateTimeout = null;
    let callbacks = forceUpdateCallbacks;
    forceUpdateCallbacks = [];
    forceUpdateAll();
    callbacks.forEach(cb => cb());
  });
};
function forceUpdateAll() {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!hook) {
    return;
  }
  const renderersById = hook._renderers;
  const ids = Object.keys(renderersById);
  const renderers = ids.map(id => renderersById[id]);
  // TODO: support Fiber
  renderers.forEach(renderer => {
    const roots = renderer.Mount && renderer.Mount._instancesByReactRootID;
    if (!roots) {
      return;
    }
    Object.keys(roots).forEach(key => {
      function traverseDeep(ins, cb) {
        cb(ins);
        if (ins._renderedComponent) {
          traverseDeep(ins._renderedComponent, cb);
        } else {
          for (let key in ins._renderedChildren) {
            if (ins._renderedChildren.hasOwnProperty(key)) {
              traverseDeep(ins._renderedChildren[key], cb);
            }
          }
        }
      }
      const root = roots[key];
      traverseDeep(root, inst => {
        if (!inst._instance) {
          return;
        }
        const updater = inst._instance.updater;
        if (!updater || typeof updater.enqueueForceUpdate !== 'function') {
          return;
        }
        updater.enqueueForceUpdate(inst._instance);
      });
    });
  });
}
