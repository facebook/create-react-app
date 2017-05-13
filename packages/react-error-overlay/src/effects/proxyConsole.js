/* @flow */

type ReactFrame = {
  fileName: string | null,
  lineNumber: number | null,
  functionName: string | null,
};
const ReactFrameStack: Array<ReactFrame[]> = [];

export type { ReactFrame };

const registerReactStack = () => {
  // $FlowFixMe
  console.stack = frames => ReactFrameStack.push(frames);
  // $FlowFixMe
  console.stackEnd = frames => ReactFrameStack.pop();
};

const unregisterReactStack = () => {
  // $FlowFixMe
  console.stack = undefined;
  // $FlowFixMe
  console.stackEnd = undefined;
};

type ConsoleProxyCallback = (
  message: string,
  frames: ReactFrame[] | void
) => void;
const permanentRegister = function proxyConsole(
  type: string,
  callback: ConsoleProxyCallback
) {
  const orig = console[type];
  console[type] = function __stack_frame_overlay_proxy_console__() {
    const message = [].slice.call(arguments).join(' ');
    callback(message, ReactFrameStack[ReactFrameStack.length - 1]);
    return orig.apply(this, arguments);
  };
};

export { permanentRegister, registerReactStack, unregisterReactStack };
