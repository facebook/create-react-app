/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

// TODO: this is noisy when client is not running
// but it still gets the job done. Add a silent mode
// that won't attempt to connect maybe?
require('react-devtools-core');

const highlight = require('./nodeHighlighter');

let forceUpdateCallbacks = [];
let forceUpdateTypes = [];
let forceUpdateTimeout = null;
let nodes = [];
window.__enqueueForceUpdate = function(onSuccess, type) {
  forceUpdateCallbacks.push(onSuccess);
  forceUpdateTypes.push(type);
  if (forceUpdateTimeout) {
    return;
  }
  forceUpdateTimeout = setTimeout(() => {
    forceUpdateTimeout = null;
    let callbacks = forceUpdateCallbacks;
    forceUpdateCallbacks = [];
    let types = forceUpdateTypes;
    forceUpdateTypes = [];
    forceUpdateAll(types);
    callbacks.forEach(cb => cb());
    highlight(nodes);
    nodes = [];
    if (console != null) {
      if (typeof console.clear === 'function') {
        console.clear();
      }
      if (typeof console.info === 'function') {
        const names = types
          .map(type => type.displayName || type.name)
          .filter(Boolean);
        if (names.length > 0) {
          console.info('Reloaded components: ' + names.join(',') + '.');
        }
      }
    }
  });
};
function forceUpdateAll(types) {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const renderersById = hook._renderers;
  const ids = Object.keys(renderersById);
  const renderers = ids.map(id => renderersById[id]);
  // TODO: support Fiber
  renderers.forEach(renderer => {
    const roots = renderer.Mount && renderer.Mount._instancesByReactRootID;
    const { getNodeFromInstance } = renderer.ComponentTree;
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
        const { type, type: { __hot__id } } = inst._currentElement;
        if (
          types.find(
            t => t === type || (__hot__id && t.__hot__id === __hot__id)
          )
        ) {
          nodes.push(getNodeFromInstance(inst));
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
