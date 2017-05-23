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

const CANVAS_NODE_ID = 'ReactHotReloadUpdateTrace';

function createCanvas() {
  let canvas = window.document.getElementById(CANVAS_NODE_ID) ||
    window.document.createElement('canvas');
  canvas.id = CANVAS_NODE_ID;
  canvas.width = window.screen.availWidth;
  canvas.height = window.screen.availHeight;
  canvas.style.cssText = `
        xx-background-color: red;
        xx-opacity: 0.5;
        bottom: 0;
        left: 0;
        pointer-events: none;
        position: fixed;
        right: 0;
        top: 0;
        z-index: 1000000000;
      `;
  if (!canvas.parentNode) {
    const root = window.document.documentElement;
    root.insertBefore(canvas, root.firstChild);
  }
  return canvas;
}

function removeCanvas(canvas) {
  canvas.parentNode.removeChild(canvas);
}

const OUTLINE_COLOR = '#f0f0f0';

const COLORS = [
  // coolest
  '#55cef6',
  '#55f67b',
  '#a5f655',
  '#f4f655',
  '#f6a555',
  '#f66855',
  // hottest
  '#ff0000',
];

function drawBorder(ctx, measurement, borderWidth, borderColor) {
  // outline
  ctx.lineWidth = 1;
  ctx.strokeStyle = OUTLINE_COLOR;

  ctx.strokeRect(
    measurement.left - 1,
    measurement.top - 1,
    measurement.width + 2,
    measurement.height + 2
  );

  // inset
  ctx.lineWidth = 1;
  ctx.strokeStyle = OUTLINE_COLOR;
  ctx.strokeRect(
    measurement.left + borderWidth,
    measurement.top + borderWidth,
    measurement.width - borderWidth,
    measurement.height - borderWidth
  );
  ctx.strokeStyle = borderColor;

  ctx.setLineDash([0]);

  // border
  ctx.lineWidth = '' + borderWidth;
  ctx.strokeRect(
    measurement.left + Math.floor(borderWidth / 2),
    measurement.top + Math.floor(borderWidth / 2),
    measurement.width - borderWidth,
    measurement.height - borderWidth
  );

  ctx.setLineDash([0]);
}

let nodes = [];
function flashNodes() {
  const canvas = createCanvas();
  let count = 0;
  for (const node of nodes) {
    drawBorder(
      canvas.getContext('2d'),
      node.getBoundingClientRect(),
      3,
      COLORS[count++ % COLORS.length]
    );
  }
  setTimeout(() => removeCanvas(canvas), 250);
  nodes = [];
}

let forceUpdateCallbacks = [];
let forceUpdateTypes = [];
let forceUpdateTimeout = null;
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
    flashNodes();
  });
};
function forceUpdateAll(types) {
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
        const { type, type: { name } } = inst._currentElement;
        if (types.find(t => t === type || t.name === name)) {
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
