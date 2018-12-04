import React from 'react';

let HotContext = React.createContext();
let _invalidate;
export function HotContainer({ children }) {
  const [inc, setInc] = React.useState(0);
  _invalidate = () => setInc(c => c + 1);
  return <HotContext.Provider value={inc}>{children}</HotContext.Provider>;
}

window.__assign = function(m, localId, value) {
  m.hot.accept();
  m.hot.dispose(() => {
    setTimeout(() => _invalidate());
  });
  const id = m.i + '$' + localId;
  window['latest_' + id] = value;
  let orig = window['orig_' + id];
  if (!orig) {
    // Can fall back to a custom convention, e.g.
    // orig.__apply__ if React respects that.
    orig = new Proxy(value, {
      apply(target, thisArg, args) {
        let ret = window['latest_' + id].apply(null, args);
        React.useContext(HotContext);
        return ret;
      },
    });
    window['orig_' + id] = orig;
  }
  return orig;
};
