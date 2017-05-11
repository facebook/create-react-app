// @flow

// This is a list of React warnings to display
// There must be zero or one capture group; and the capture group is assumed to be a missing stack frame.
const warnings = [
  /^.*React.createElement: type is invalid.+Check your code at (.*?:.*)[.]$/,
];
// This is a list of information to remove from React warnings, it's not particularly useful to show
const removals = [/Check your code at (.*?:.*)[.]/];

function massage(warning: string): { message: string, stack: string } | null {
  const nIndex = warning.indexOf('\n');
  let message = warning;
  if (nIndex !== -1) {
    message = message.substring(0, nIndex);
  }
  let stack = warning.substring(nIndex + 1);

  let found = false;
  for (const warning of warnings) {
    const m = message.match(warning);
    if (!m) {
      continue;
    }
    found = true;
    if (!m[1]) {
      break;
    }
    stack = `in render (at ${m[1]})\n${stack}`;
    break;
  }
  if (!found) {
    return null;
  }

  for (const trim of removals) {
    message = message.replace(trim, '');
  }

  return { message, stack };
}

export { massage };
