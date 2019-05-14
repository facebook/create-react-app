/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { useContext } from 'react';
import { ThemeContext } from '../iframeScript';

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

const codeStyle = {
  fontFamily: 'Consolas, Menlo, monospace',
};

type CodeBlockPropsType = {|
  main: boolean,
  codeHTML: string,
|};

function CodeBlock({ main, codeHTML }: CodeBlockPropsType) {
  const theme = useContext(ThemeContext);
  const primaryPreStyle = {
    ..._preStyle,
    backgroundColor: theme.primaryPreBackground,
    color: theme.primaryPreColor,
  };
  const secondaryPreStyle = {
    ..._preStyle,
    backgroundColor: theme.secondaryPreBackground,
    color: theme.secondaryPreColor,
  };
  const preStyle = main ? primaryPreStyle : secondaryPreStyle;
  const codeBlock = { __html: codeHTML };

  return (
    <pre style={preStyle}>
      <code style={codeStyle} dangerouslySetInnerHTML={codeBlock} />
    </pre>
  );
}

export default CodeBlock;
