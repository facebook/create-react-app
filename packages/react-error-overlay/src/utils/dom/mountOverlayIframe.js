/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import { iframeStyle, overlayStyle } from '../../styles';
import { applyStyles } from './css';

function mountOverlayIframe(
  callback: (containerDiv: HTMLDivElement) => void
): HTMLIFrameElement {
  const iframe = window.document.createElement('iframe');
  applyStyles(iframe, iframeStyle);
  iframe.onload = () => {
    const document = iframe.contentDocument;
    if (document != null && document.body != null) {
      document.body.style.margin = '0';
      // Keep popup within body boundaries for iOS Safari
      document.body.style['max-width'] = '100vw';
      const container = document.createElement('div');
      applyStyles(container, overlayStyle);
      (document.body: any).appendChild(container);
      callback(container);
    }
  };
  window.document.body.appendChild(iframe);
  return iframe;
}

export { mountOverlayIframe };
