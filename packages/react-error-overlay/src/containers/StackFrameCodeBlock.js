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
import CodeBlock from '../components/CodeBlock';
import { applyStyles } from '../utils/dom/css';
import { absolutifyCaret } from '../utils/dom/absolutifyCaret';
import type { ScriptLine } from '../utils/stack-frame';
import { primaryErrorStyle, secondaryErrorStyle } from '../styles';
import generateAnsiHTML from '../utils/generateAnsiHTML';

import codeFrame from 'babel-code-frame';

type StackFrameCodeBlockPropsType = {|
  lines: ScriptLine[],
  lineNum: number,
  columnNum: number,
  contextSize: number,
  main: boolean,
|};

function StackFrameCodeBlock(props: StackFrameCodeBlockPropsType) {
  const { lines, lineNum, columnNum, contextSize, main } = props;
  const sourceCode = [];
  let whiteSpace = Infinity;
  lines.forEach(function(e) {
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
  lines.forEach(function(e) {
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
  const htmlHighlight = generateAnsiHTML(ansiHighlight);
  const code = document.createElement('code');
  code.innerHTML = htmlHighlight;
  absolutifyCaret(code);

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

  return <CodeBlock main={main} codeHTML={code.innerHTML} />;
}

export default StackFrameCodeBlock;
