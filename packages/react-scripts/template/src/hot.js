import React from 'react';

let HotContext = React.createContext();
let _invalidate;
export function HotContainer({ children }) {
  const [inc, setInc] = React.useState(0);
  _invalidate = () => setInc(c => c + 1);
  return <HotContext.Provider value={inc}>{children}</HotContext.Provider>;
}

window.__createProxy = function(m, localId) {
  m.hot.accept();
  m.hot.dispose(() => {
    setTimeout(() => window.__enqueueForceUpdate());
  });
  const id = m.i + '$' + localId;

  if (!window[`${id}_proxy`]) {
    function P(...args) {
      let impl = window[`${id}_impl`];
      if (impl.prototype && impl.prototype.isReactComponent) {
        return new impl(...args);
      }
      let res = impl.apply(this, arguments);
      window.__renderHook();
      return res;
    }
    window[`${id}_proxy`] = P;
    P.__setImpl = impl => {
      window[`${id}_impl`] = impl;
    };
  }
  return window[`${id}_proxy`];
};

window.__enqueueForceUpdate = function(type) {
  _invalidate();
};

window.__renderHook = function(type) {
  React.useContext(HotContext);
};
