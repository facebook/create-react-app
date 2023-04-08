/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { useContext } from 'react';
import { ThemeContext } from '../iframeScript';
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

type CompileErrorContainerPropsType = {|
  error: string,
  editorHandler: (errorLoc: ErrorLocation) => void,
|};

function CompileErrorContainer(props: CompileErrorContainerPropsType) {
  const theme = useContext(ThemeContext);
  const { error, editorHandler } = props;
  const errLoc: ?ErrorLocation = parseCompileError(error);
  const canOpenInEditor = errLoc !== null && editorHandler !== null;
  return (
    <ErrorOverlay>
      <Header headerText="Failed to compile" />
      <div
        onClick={canOpenInEditor && errLoc ? () => editorHandler(errLoc) : null}
        style={canOpenInEditor ? codeAnchorStyle : null}
      >
        <CodeBlock main={true} codeHTML={generateAnsiHTML(error, theme)} />
      </div>
      <Footer line1="This error occurred during the build time and cannot be dismissed." />
    </ErrorOverlay>
  );
}

export default CompileErrorContainer;
