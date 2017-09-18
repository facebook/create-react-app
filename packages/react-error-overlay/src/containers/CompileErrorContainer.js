/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import React, { PureComponent } from 'react';
import ErrorOverlay from '../components/ErrorOverlay';
import Footer from '../components/Footer';
import Header from '../components/Header';
import CodeBlock from '../components/CodeBlock';
import generateAnsiHTML from '../utils/generateAnsiHTML';

type Props = {|
  error: string,
|};

class CompileErrorContainer extends PureComponent<Props, void> {
  render() {
    const { error } = this.props;
    return (
      <ErrorOverlay>
        <Header headerText="Failed to compile" />
        <CodeBlock main={true} codeHTML={generateAnsiHTML(error)} />
        <Footer line1="This error occurred during the build time and cannot be dismissed." />
      </ErrorOverlay>
    );
  }
}

export default CompileErrorContainer;
