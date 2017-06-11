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
import Header from './Header';
import StackTrace from './StackTrace';
import type { StackFrame } from '../utils/stack-frame';

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
};

type ErrorRecord = {
  error: Error,
  unhandledRejection: boolean,
  contextSize: number,
  stackFrames: StackFrame[],
};

function ErrorView({ errorRecord }: { errorRecord: ErrorRecord }) {
  const { error, unhandledRejection, contextSize, stackFrames } = errorRecord;
  const errorName = unhandledRejection
    ? 'Unhandled Rejection (' + error.name + ')'
    : error.name;

  return (
    <div style={wrapperStyle}>
      <Header name={errorName} message={error.message} />
      <StackTrace
        stackFrames={stackFrames}
        errorName={errorName}
        contextSize={contextSize}
      />
    </div>
  );
}

export default ErrorView;
