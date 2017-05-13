// @flow
import type { ReactFrame } from '../effects/proxyConsole';

function stripInlineStacktrace(message: string): string {
  return message.split('\n').filter(line => !line.match(/^\s*in/)).join('\n'); // "  in Foo"
}

function massage(
  warning: string,
  frames: ReactFrame[]
): { message: string, stack: string } {
  let message = stripInlineStacktrace(warning);

  // Reassemble the stack with full filenames provided by React
  let stack = '';
  for (let index = 0; index < frames.length; ++index) {
    const { fileName, lineNumber } = frames[index];
    if (fileName == null || lineNumber == null) {
      continue;
    }
    let { functionName } = frames[index];
    functionName = functionName || '(anonymous function)';
    stack += `in ${functionName} (at ${fileName}:${lineNumber})\n`;
  }

  return { message, stack };
}

export { massage };
