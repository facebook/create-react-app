/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import { applyStyles } from '../utils/dom/css';
import { hintsStyle, hintStyle, closeButtonStyle } from '../styles';

function createHint(document: Document, hint: string, title: string) {
  const span = document.createElement('span');
  span.appendChild(document.createTextNode(hint));
  span.setAttribute('title', title);
  applyStyles(span, hintStyle);
  return span;
}

type CloseCallback = () => void;
function createClose(document: Document, callback: CloseCallback) {
  const hints = document.createElement('div');
  applyStyles(hints, hintsStyle);

  const close = createHint(document, '×', 'Click or press Escape to dismiss.');
  close.addEventListener('click', () => callback());
  applyStyles(close, closeButtonStyle);
  hints.appendChild(close);
  return hints;
}

export type { CloseCallback };
export { createClose };
