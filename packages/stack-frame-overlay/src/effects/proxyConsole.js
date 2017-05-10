/* @flow */
type ConsoleProxyCallback = (message: string) => void;
const permanentRegister = function proxyConsole(
  type: string,
  callback: ConsoleProxyCallback
) {
  const orig = console[type];
  console[type] = function __stack_frame_overlay_proxy_console__() {
    const message = [].slice.call(arguments).join(' ');
    callback(message);
    return orig.apply(this, arguments);
  };
};

export { permanentRegister };
