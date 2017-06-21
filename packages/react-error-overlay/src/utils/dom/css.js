/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
let injectedCount = 0;
const injectedCache = {};

function getHead(document: Document) {
  return document.head || document.getElementsByTagName('head')[0];
}

function injectCss(document: Document, css: string): number {
  const head = getHead(document);
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

  injectedCache[++injectedCount] = style;
  return injectedCount;
}

function removeCss(document: Document, ref: number) {
  if (injectedCache[ref] == null) {
    return;
  }
  const head = getHead(document);
  head.removeChild(injectedCache[ref]);
  delete injectedCache[ref];
}

function applyStyles(element: HTMLElement, styles: Object) {
  element.setAttribute('style', '');
  for (const key in styles) {
    if (!styles.hasOwnProperty(key)) {
      continue;
    }
    // $FlowFixMe
    element.style[key] = styles[key];
  }
}

export { getHead, injectCss, removeCss, applyStyles };
