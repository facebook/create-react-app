/* @flow */
import type { StackFrame } from 'stack-frame';
import { parse } from 'stack-frame-parser';
import { map } from 'stack-frame-mapper';
import { unmap } from 'stack-frame-unmapper';

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
): Promise<ErrorRecordReference> {
  const parsedFrames = parse(error);
  let enhancedFramesPromise;
  if (error.__unmap_source) {
    enhancedFramesPromise = unmap(
      error.__unmap_source,
      parsedFrames,
      contextSize
    );
  } else {
    enhancedFramesPromise = map(parsedFrames, contextSize);
  }
  return enhancedFramesPromise.then(enhancedFrames => {
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
