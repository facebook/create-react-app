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
import { footerStyle } from '../styles';

function createFooter(document: Document) {
  const div = document.createElement('div');
  applyStyles(div, footerStyle);
  div.appendChild(
    document.createTextNode(
      'This screen is visible only in development. It will not appear if the app crashes in production.'
    )
  );
  div.appendChild(document.createElement('br'));
  div.appendChild(
    document.createTextNode(
      'Open your browser’s developer console to further inspect this error.'
    )
  );
  return div;
}

export { createFooter };
