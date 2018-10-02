/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React from 'react';
import { redTransparent, yellowTransparent } from '../styles';

const _preStyle = {
  position: 'relative',
  display: 'block',
  padding: '0.5em',
  marginTop: '0.5em',
  marginBottom: '0.5em',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
  borderRadius: '0.25rem',
};

const primaryPreStyle = {
  ..._preStyle,
  backgroundColor: redTransparent,
};

const secondaryPreStyle = {
  ..._preStyle,
  backgroundColor: yellowTransparent,
};

const codeStyle = {
  fontFamily: 'Consolas, Menlo, monospace',
};

type CodeBlockPropsType = {|
  main: boolean,
  codeHTML: string,
|};

function CodeBlock(props: CodeBlockPropsType) {
  const preStyle = props.main ? primaryPreStyle : secondaryPreStyle;
  const codeBlock = { __html: props.codeHTML };

  return (
    <pre style={preStyle}>
      <code style={codeStyle} dangerouslySetInnerHTML={codeBlock} />
    </pre>
  );
}

export default CodeBlock;
