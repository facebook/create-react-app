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
  editorHandler: (errorLoc: ErrorLocation) => void,
|};

class CompileErrorContainer extends PureComponent<Props, void> {
  render() {
    const { error, editorHandler } = this.props;
    const errLoc: ?ErrorLocation = parseCompileError(error);
    const canOpenInEditor = errLoc !== null && editorHandler !== null;
    return (
      <ErrorOverlay>
        <Header headerText="Failed to compile" />
        <a
          onClick={
            canOpenInEditor && errLoc ? () => editorHandler(errLoc) : null
          }
          style={canOpenInEditor ? codeAnchorStyle : null}
        >
          <CodeBlock main={true} codeHTML={generateAnsiHTML(error)} />
        </a>
        <Footer
          line1="This error occurred during the build time and cannot be dismissed."
        />
      </ErrorOverlay>
    );
  }
}

export default CompileErrorContainer;
