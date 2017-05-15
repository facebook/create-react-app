/* @flow */
let stackTraceRegistered: boolean = false;
// Default: https://docs.microsoft.com/en-us/scripting/javascript/reference/stacktracelimit-property-error-javascript
let restoreStackTraceValue: number = 10;

const MAX_STACK_LENGTH: number = 50;

function registerStackTraceLimit(limit: number = MAX_STACK_LENGTH) {
  if (stackTraceRegistered) {
    return;
  }
  try {
    restoreStackTraceValue = Error.stackTraceLimit;
    Error.stackTraceLimit = limit;
    stackTraceRegistered = true;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

function unregisterStackTraceLimit() {
  if (!stackTraceRegistered) {
    return;
  }
  try {
    Error.stackTraceLimit = restoreStackTraceValue;
    stackTraceRegistered = false;
  } catch (e) {
    // Not all browsers support this so we don't care if it errors
  }
}

export {
  registerStackTraceLimit as register,
  unregisterStackTraceLimit as unregister,
};
