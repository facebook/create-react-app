/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { PureComponent } from 'react';
import ErrorOverlay from '../components/ErrorOverlay';
import Footer from '../components/Footer';
import Header from '../components/Header';
import CodeBlock from '../components/CodeBlock';
import generateAnsiHTML from '../utils/generateAnsiHTML';
import parseCompileError from '../utils/parseCompileError';
import type { ErrorLocation } from '../utils/parseCompileError';

const codeAnchorStyle = {
  cursor: 'pointer',
};

type Props = {|
  error: string,
|};

class CompileErrorContainer extends PureComponent<Props, void> {
  openInEditor(errorLoc: ErrorLocation): void {
    const { filePath, lineNumber } = errorLoc;
    fetch(
      `/__open-stack-frame-in-editor?fileName=` +
        window.encodeURIComponent(filePath) +
        '&lineNumber=' +
        window.encodeURIComponent(lineNumber || 1)
    ).then(() => {}, () => {});
  }

  render() {
    const { error } = this.props;
    const errLoc = parseCompileError(error);
    return (
      <ErrorOverlay>
        <Header headerText="Failed to compile" />
        <a
          onClick={errLoc ? () => this.openInEditor(errLoc) : null}
          style={errLoc ? codeAnchorStyle : null}
        >
          <CodeBlock main={true} codeHTML={generateAnsiHTML(error)} />
        </a>
        <Footer line1="This error occurred during the build time and cannot be dismissed." />
      </ErrorOverlay>
    );
  }
}

export default CompileErrorContainer;
