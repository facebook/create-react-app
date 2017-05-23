/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

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

function mount() {
  let canvas = window.document.createElement('canvas');
  canvas.width = window.screen.availWidth;
  canvas.height = window.screen.availHeight;
  canvas.style.cssText = `
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1000000000;
    `;

  const root = window.document.documentElement;
  root.insertBefore(canvas, root.firstChild);
  return canvas;
}

function unmount(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.parentNode.removeChild(canvas);
}

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

function highlight(nodes, { borderWidth = 3, duration = 250 } = {}) {
  const canvas = mount();
  const ctx = canvas.getContext('2d');
  let count = 0;
  for (const node of nodes) {
    drawBorder(
      ctx,
      node.getBoundingClientRect(),
      borderWidth,
      COLORS[count++ % COLORS.length]
    );
  }
  setTimeout(() => unmount(canvas), duration);
}

module.exports = highlight;
