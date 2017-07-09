/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import React from 'react';
import ReactDOM from 'react-dom';
import CompileErrorContainer from './containers/CompileErrorContainer';
import { mountOverlayIframe } from './utils/dom/mountOverlayIframe';

let container: HTMLDivElement | null = null;
let iframeReference: HTMLIFrameElement | null = null;

function mount(callback) {
  iframeReference = mountOverlayIframe(containerDiv => {
    container = containerDiv;
    callback();
  });
}

function unmount() {
  if (iframeReference === null) {
    return;
  }
  ReactDOM.unmountComponentAtNode(container);
  window.document.body.removeChild(iframeReference);
  iframeReference = null;
  container = null;
}

function render(error: string) {
  ReactDOM.render(<CompileErrorContainer error={error} />, container);
}

function showCompileErrorOverlay(error: string) {
  if (container == null) {
    mount(() => render(error));
  } else {
    render(error);
  }
  return unmount;
}

export { showCompileErrorOverlay };
