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
import {
  additionalChildStyle,
  groupStyle,
  groupElemLeft,
  groupElemRight,
} from '../styles';
import { consumeEvent } from '../utils/dom/consumeEvent';
import { enableTabClick } from '../utils/dom/enableTabClick';

type SwitchCallback = (offset: number) => void;
function updateAdditional(
  document: Document,
  additionalReference: HTMLDivElement,
  currentError: number,
  totalErrors: number,
  switchCallback: SwitchCallback
) {
  if (additionalReference.lastChild) {
    additionalReference.removeChild(additionalReference.lastChild);
  }

  if (totalErrors <= 1) {
    return;
  }

  const div = document.createElement('div');
  applyStyles(div, additionalChildStyle);

  const group = document.createElement('span');
  applyStyles(group, groupStyle);

  const left = document.createElement('button');
  applyStyles(left, groupElemLeft);
  left.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchCallback(-1);
  });
  left.appendChild(document.createTextNode('←'));
  enableTabClick(left);

  const right = document.createElement('button');
  applyStyles(right, groupElemRight);
  right.addEventListener('click', function(e: MouseEvent) {
    consumeEvent(e);
    switchCallback(1);
  });
  right.appendChild(document.createTextNode('→'));
  enableTabClick(right);

  group.appendChild(left);
  group.appendChild(right);
  div.appendChild(group);

  const text = `${currentError} of ${totalErrors} errors on the page`;
  div.appendChild(document.createTextNode(text));

  additionalReference.appendChild(div);
}

export type { SwitchCallback };
export { updateAdditional };
