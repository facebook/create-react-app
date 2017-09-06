/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import React, { Component } from 'react';
import CodeBlock from './StackFrameCodeBlock';
import { getPrettyURL } from '../utils/getPrettyURL';
import { darkGray } from '../styles';

const linkStyle = {
  fontSize: '0.9em',
  marginBottom: '0.9em',
};

const anchorStyle = {
  textDecoration: 'none',
  color: darkGray,
  cursor: 'pointer',
};

const codeAnchorStyle = {
  cursor: 'pointer',
};

const toggleStyle = {
  marginBottom: '1.5em',
  color: darkGray,
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: '#fff',
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: '1em',
  padding: '0px',
  lineHeight: '1.5',
};

class StackFrame extends Component {
  state = {
    compiled: false,
  };

  toggleCompiled = () => {
    this.setState(state => ({
      compiled: !state.compiled,
    }));
  };

  canOpenInEditor() {
    if (!this.props.launchEditorEndpoint) {
      return;
    }
    const { _originalFileName: sourceFileName } = this.props.frame;
    // Unknown file
    if (!sourceFileName) {
      return false;
    }
    // e.g. "/path-to-my-app/webpack/bootstrap eaddeb46b67d75e4dfc1"
    const isInternalWebpackBootstrapCode =
      sourceFileName.trim().indexOf(' ') !== -1;
    if (isInternalWebpackBootstrapCode) {
      return false;
    }
    // Code is in a real file
    return true;
  }

  openInEditor = () => {
    if (!this.canOpenInEditor()) {
      return;
    }
    const {
      _originalFileName: sourceFileName,
      _originalLineNumber: sourceLineNumber,
    } = this.props.frame;
    // Keep this in sync with react-error-overlay/middleware.js
    fetch(
      `${this.props.launchEditorEndpoint}?fileName=` +
        window.encodeURIComponent(sourceFileName) +
        '&lineNumber=' +
        window.encodeURIComponent(sourceLineNumber || 1)
    ).then(() => {}, () => {});
  };

  onKeyDown = (e: SyntheticKeyboardEvent) => {
    if (e.key === 'Enter') {
      this.openInEditor();
    }
  };

  render() {
    const { frame, contextSize, critical, showCode } = this.props;
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

    const compiled = this.state.compiled;
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

    const canOpenInEditor = this.canOpenInEditor();
    return (
      <div>
        <div>
          {functionName}
        </div>
        <div style={linkStyle}>
          <a
            style={canOpenInEditor ? anchorStyle : null}
            onClick={canOpenInEditor ? this.openInEditor : null}
            onKeyDown={canOpenInEditor ? this.onKeyDown : null}
            tabIndex={canOpenInEditor ? '0' : null}
          >
            {url}
          </a>
        </div>
        {codeBlockProps &&
          <span>
            <a
              onClick={canOpenInEditor ? this.openInEditor : null}
              style={canOpenInEditor ? codeAnchorStyle : null}
            >
              <CodeBlock {...codeBlockProps} />
            </a>
            <button style={toggleStyle} onClick={this.toggleCompiled}>
              {'View ' + (compiled ? 'source' : 'compiled')}
            </button>
          </span>}
      </div>
    );
  }
}

export default StackFrame;
