/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import type { ScriptLine } from '../utils/stack-frame';
import { applyStyles } from '../utils/dom/css';
import { absolutifyCaret } from '../utils/dom/absolutifyCaret';
import {
  codeStyle,
  primaryErrorStyle,
  primaryPreStyle,
  secondaryErrorStyle,
  secondaryPreStyle,
} from '../styles';

import generateAnsiHtml from 'react-dev-utils/ansiHTML';

import codeFrame from 'babel-code-frame';

function createCode(
  document: Document,
  sourceLines: ScriptLine[],
  lineNum: number,
  columnNum: number | null,
  contextSize: number,
  main: boolean,
  onSourceClick: ?Function
) {
  const sourceCode = [];
  let whiteSpace = Infinity;
  sourceLines.forEach(function(e) {
    const { content: text } = e;
    const m = text.match(/^\s*/);
    if (text === '') {
      return;
    }
    if (m && m[0]) {
      whiteSpace = Math.min(whiteSpace, m[0].length);
    } else {
      whiteSpace = 0;
    }
  });
  sourceLines.forEach(function(e) {
    let { content: text } = e;
    const { lineNumber: line } = e;

    if (isFinite(whiteSpace)) {
      text = text.substring(whiteSpace);
    }
    sourceCode[line - 1] = text;
  });
  const ansiHighlight = codeFrame(
    sourceCode.join('\n'),
    lineNum,
    columnNum == null ? 0 : columnNum - (isFinite(whiteSpace) ? whiteSpace : 0),
    {
      forceColor: true,
      linesAbove: contextSize,
      linesBelow: contextSize,
    }
  );
  const htmlHighlight = generateAnsiHtml(ansiHighlight);
  const code = document.createElement('code');
  code.innerHTML = htmlHighlight;
  absolutifyCaret(code);
  applyStyles(code, codeStyle);

  const ccn = code.childNodes;
  // eslint-disable-next-line
  oLoop: for (let index = 0; index < ccn.length; ++index) {
    const node = ccn[index];
    const ccn2 = node.childNodes;
    for (let index2 = 0; index2 < ccn2.length; ++index2) {
      const lineNode = ccn2[index2];
      const text = lineNode.innerText;
      if (text == null) {
        continue;
      }
      if (text.indexOf(' ' + lineNum + ' |') === -1) {
        continue;
      }
      // $FlowFixMe
      applyStyles(node, main ? primaryErrorStyle : secondaryErrorStyle);
      // eslint-disable-next-line
      break oLoop;
    }
  }
  const pre = document.createElement('pre');
  applyStyles(pre, main ? primaryPreStyle : secondaryPreStyle);
  pre.appendChild(code);

  if (typeof onSourceClick === 'function') {
    let handler = onSourceClick;
    pre.style.cursor = 'pointer';
    pre.addEventListener('click', function() {
      handler();
    });
  }

  return pre;
}

export { createCode };
