/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const restrictedGlobals = [
  ['addEventListener', 'document'],
  ['blur', 'window'],
  ['close', 'window'],
  ['closed', 'window'],
  ['confirm', 'window'],
  ['defaultStatus', 'none'],
  ['defaultstatus', 'none'],
  ['event', 'none'],
  ['external', 'none'],
  ['find', 'none'],
  ['focus', 'window'],
  ['frameElement', 'window'],
  ['frames', 'window'],
  ['history', 'window'],
  ['innerHeight', 'window'],
  ['innerWidth', 'window'],
  ['length', 'window'],
  ['location', 'window'],
  ['locationbar', 'window'],
  ['menubar', 'window'],
  ['moveBy', 'window'],
  ['moveTo', 'window'],
  ['name', 'window'],
  ['onblur', 'window'],
  ['onerror', 'window'],
  ['onfocus', 'window'],
  ['onload', 'window'],
  ['onresize', 'window'],
  ['onunload', 'window'],
  ['open', 'window'],
  ['opener', 'window'],
  ['opera', 'window'],
  ['outerHeight', 'window'],
  ['outerWidth', 'window'],
  ['pageXOffset', 'window'],
  ['pageYOffset', 'window'],
  ['parent', 'window'],
  ['print', 'window'],
  ['removeEventListener', 'document'],
  ['resizeBy', 'window'],
  ['resizeTo', 'window'],
  ['screen', 'window'],
  ['screenLeft', 'window'],
  ['screenTop', 'window'],
  ['screenX', 'window'],
  ['screenY', 'window'],
  ['scroll', 'window'],
  ['scrollbars', 'window'],
  ['scrollBy', 'window'],
  ['scrollTo', 'window'],
  ['scrollX', 'window'],
  ['scrollY', 'window'],
  ['self', 'WorkerGlobalScope'],
  ['status', 'window'],
  ['statusbar', 'window'],
  ['stop', 'window'],
  ['toolbar', 'window'],
  ['top', 'window'],
];

module.exports = restrictedGlobals.map(([name, parent]) => {
  const message =
    parent === 'none'
      ? 'Use local parameter instead.'
      : `Use local parameter or ${parent}.${name} instead.`;

  return { name, message };
});
