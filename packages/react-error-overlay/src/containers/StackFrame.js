/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { useState, useContext } from 'react';
import { ThemeContext } from '../iframeScript';
import CodeBlock from './StackFrameCodeBlock';
import { getPrettyURL } from '../utils/getPrettyURL';

import type { StackFrame as StackFrameType } from '../utils/stack-frame';
import type { ErrorLocation } from '../utils/parseCompileError';
import type { Theme } from '../styles';

const linkStyle = (theme: Theme) => ({
  fontSize: '0.9em',
  marginBottom: '0.9em',
});

const anchorStyle = (theme: Theme) => ({
  textDecoration: 'none',
  color: theme.anchorColor,
  cursor: 'pointer',
});

const codeAnchorStyle = (theme: Theme) => ({
  cursor: 'pointer',
});

const toggleStyle = (theme: Theme) => ({
  marginBottom: '1.5em',
  color: theme.toggleColor,
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: theme.toggleBackground,
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: '1em',
  padding: '0px',
  lineHeight: '1.5',
});

type StackFramePropsType = {|
  frame: StackFrameType,
  contextSize: number,
  critical: boolean,
  showCode: boolean,
  editorHandler: (errorLoc: ErrorLocation) => void,
|};

function StackFrame(props: StackFramePropsType) {
  const theme = useContext(ThemeContext);
  const [compiled, setCompiled] = useState(false);

  const toggleCompiled = () => {
    setCompiled(!compiled);
  };

  const getErrorLocation = (): ErrorLocation | null => {
    const {
      _originalFileName: fileName,
      _originalLineNumber: lineNumber,
    } = props.frame;
    // Unknown file
    if (!fileName) {
      return null;
    }
    // e.g. "/path-to-my-app/webpack/bootstrap eaddeb46b67d75e4dfc1"
    const isInternalWebpackBootstrapCode = fileName.trim().indexOf(' ') !== -1;
    if (isInternalWebpackBootstrapCode) {
      return null;
    }
    // Code is in a real file
    return { fileName, lineNumber: lineNumber || 1 };
  };

  const editorHandler = () => {
    const errorLoc = getErrorLocation();
    if (!errorLoc) {
      return;
    }
    props.editorHandler(errorLoc);
  };

  const onKeyDown = (e: SyntheticKeyboardEvent<any>) => {
    if (e.key === 'Enter') {
      editorHandler();
    }
  };

  const { frame, contextSize, critical, showCode } = props;
  const {
    fileName,
    lineNumber,
    columnNumber,
    _scriptCode: scriptLines,
    _originalFileName: sourceFileName,
    _originalLineNumber: sourceLineNumber,
    _originalColumnNumber: sourceColumnNumber,
    _originalScriptCode: sourceLines,
  } = frame;
  const functionName = frame.getFunctionName();

  const url = getPrettyURL(
    sourceFileName,
    sourceLineNumber,
    sourceColumnNumber,
    fileName,
    lineNumber,
    columnNumber,
    compiled
  );

  let codeBlockProps = null;
  if (showCode) {
    if (
      compiled &&
      scriptLines &&
      scriptLines.length !== 0 &&
      lineNumber != null
    ) {
      codeBlockProps = {
        lines: scriptLines,
        lineNum: lineNumber,
        columnNum: columnNumber,
        contextSize,
        main: critical,
      };
    } else if (
      !compiled &&
      sourceLines &&
      sourceLines.length !== 0 &&
      sourceLineNumber != null
    ) {
      codeBlockProps = {
        lines: sourceLines,
        lineNum: sourceLineNumber,
        columnNum: sourceColumnNumber,
        contextSize,
        main: critical,
      };
    }
  }

  const canOpenInEditor =
    getErrorLocation() !== null && props.editorHandler !== null;
  return (
    <div>
      <div>{functionName}</div>
      <div style={linkStyle(theme)}>
        <span
          style={canOpenInEditor ? anchorStyle(theme) : null}
          onClick={canOpenInEditor ? editorHandler : null}
          onKeyDown={canOpenInEditor ? onKeyDown : null}
          tabIndex={canOpenInEditor ? '0' : null}
        >
          {url}
        </span>
      </div>
      {codeBlockProps && (
        <span>
          <span
            onClick={canOpenInEditor ? editorHandler : null}
            style={canOpenInEditor ? codeAnchorStyle(theme) : null}
          >
            <CodeBlock {...codeBlockProps} />
          </span>
          <button style={toggleStyle(theme)} onClick={toggleCompiled}>
            {'View ' + (compiled ? 'source' : 'compiled')}
          </button>
        </span>
      )}
    </div>
  );
}

export default StackFrame;
