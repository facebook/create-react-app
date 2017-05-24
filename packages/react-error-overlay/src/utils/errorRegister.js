/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import type { StackFrame } from './stack-frame';
import { parse } from './parser';
import { map } from './mapper';
import { unmap } from './unmapper';

type ErrorRecord = {
  error: Error,
  unhandledRejection: boolean,
  contextSize: number,
  enhancedFrames: StackFrame[],
};
type ErrorRecordReference = number;
const recorded: ErrorRecord[] = [];

let errorsConsumed: ErrorRecordReference = 0;

function consume(
  error: Error,
  unhandledRejection: boolean = false,
  contextSize: number = 3
): Promise<ErrorRecordReference | null> {
  const parsedFrames = parse(error);
  let enhancedFramesPromise;
  if (error.__unmap_source) {
    enhancedFramesPromise = unmap(
      // $FlowFixMe
      error.__unmap_source,
      parsedFrames,
      contextSize
    );
  } else {
    enhancedFramesPromise = map(parsedFrames, contextSize);
  }
  return enhancedFramesPromise.then(enhancedFrames => {
    if (
      enhancedFrames
        .map(f => f._originalFileName)
        .filter(f => f != null && f.indexOf('node_modules') === -1).length === 0
    ) {
      return null;
    }
    enhancedFrames = enhancedFrames.filter(
      ({ functionName }) =>
        functionName == null ||
        functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
    );
    recorded[++errorsConsumed] = {
      error,
      unhandledRejection,
      contextSize,
      enhancedFrames,
    };
    return errorsConsumed;
  });
}

function getErrorRecord(ref: ErrorRecordReference): ErrorRecord {
  return recorded[ref];
}

function drain() {
  // $FlowFixMe
  const keys = Object.keys(recorded);
  for (let index = 0; index < keys.length; ++index) {
    delete recorded[keys[index]];
  }
}

export { consume, getErrorRecord, drain };
export type { ErrorRecordReference };
