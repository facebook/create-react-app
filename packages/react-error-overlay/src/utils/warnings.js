// @flow
import type { ReactFrame } from '../effects/proxyConsole';

// This is a list of information to remove from React warnings, it's not particularly useful to show.
const removals = [/Check your code at (.*?:.*)[.]/];

function massage(
  warning: string,
  frames: ReactFrame[] | void
): { message: string, stack: string } | null {
  if (!frames) {
    return null;
  }

  let message = warning;
  const nIndex = message.indexOf('\n');
  if (nIndex !== -1) {
    message = message.substring(0, nIndex);
  }

  for (const trim of removals) {
    message = message.replace(trim, '');
  }

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
