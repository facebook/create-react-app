/* @flow */

type ReactFrame = {
  fileName: string | null,
  lineNumber: number | null,
  functionName: string | null,
};
const reactFrameStack: Array<ReactFrame[]> = [];

export type { ReactFrame };

const registerReactStack = () => {
  // $FlowFixMe
  console.stack = frames => reactFrameStack.push(frames);
  // $FlowFixMe
  console.stackEnd = frames => reactFrameStack.pop();
};

const unregisterReactStack = () => {
  // $FlowFixMe
  console.stack = undefined;
  // $FlowFixMe
  console.stackEnd = undefined;
};

type ConsoleProxyCallback = (message: string, frames: ReactFrame[]) => void;
const permanentRegister = function proxyConsole(
  type: string,
  callback: ConsoleProxyCallback
) {
  const orig = console[type];
  console[type] = function __stack_frame_overlay_proxy_console__() {
    try {
      const message = arguments[0];
      if (typeof message === 'string' && reactFrameStack.length > 0) {
        callback(message, reactFrameStack[reactFrameStack.length - 1]);
      }
    } catch (err) {
      // Warnings must never crash. Rethrow with a clean stack.
      setTimeout(function() {
        throw err;
      });
    }
    return orig.apply(this, arguments);
  };
};

export { permanentRegister, registerReactStack, unregisterReactStack };
