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

function traverseDeep(root, onUpdate) {
  let node = root;
  while (true) {
    node.expirationTime = 1;
    if (node.alternate) {
      node.alternate.expirationTime = 1;
    }
    if (node.tag === 1) {
      onUpdate(node);
    }
    if (node.child) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === root) {
      return;
    }
    while (!node.sibling) {
      if (!node.return || node.return === root) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function forceUpdateAll(types) {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const renderersById = hook._renderers;
  const ids = Object.keys(renderersById);
  ids.forEach(id => {
    const renderer = renderersById[id];
    const roots = hook.getFiberRoots(id);
    if (!roots.size) {
      return;
    }
    // TODO: this is WAY too brittle.
    roots.forEach(root => {
      const reactRoot = root.containerInfo._reactRootContainer;
      traverseDeep(root.current, node => {
        const type = node.type;
        const { __hot__id } = type;
        if (
          types.find(
            t => t === type || (__hot__id && t.__hot__id === __hot__id)
          )
        ) {
          nodes.push(renderer.findHostInstanceByFiber(node));
        }
        node.memoizedProps = Object.assign({}, node.memoizedProps);
      });
      reactRoot.render(root.current.memoizedState.element);
    });
  });
}
