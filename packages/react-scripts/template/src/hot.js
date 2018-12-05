import React from 'react';

let HotContext = React.createContext();
let _invalidate;
export function HotContainer({ children }) {
  const [inc, setInc] = React.useState(0);
  _invalidate = () => setInc(c => c + 1);
  return <HotContext.Provider value={inc}>{children}</HotContext.Provider>;
}

let storage = new Map();
let latestRawFunctions = new Map();

function getKind(type) {
  if (typeof type === 'function') {
    if (type.prototype && type.prototype.isReactComponent) {
      return 'class';
    } else {
      return 'function';
    }
  } else if (type !== null && typeof type === 'object') {
    if (type.$$typeof === Symbol.for('react.memo')) {
      return 'memo';
    }
  }
  return 'other';
}

function init(rawType, id) {
  let kind = getKind(rawType);
  switch (kind) {
    case 'function': {
      latestRawFunctions.set(id, rawType);
      return new Proxy(rawType, {
        apply(target, thisArg, args) {
          let ret = latestRawFunctions.get(id).apply(null, args);
          React.useContext(HotContext);
          return ret;
        },
      });
    }
    case 'memo': {
      rawType.type = init(rawType.type, id);
      return rawType;
    }
    default: {
      return rawType;
    }
  }
}

function accept(type, nextRawType, id) {
  let kind = getKind(type);
  let nextKind = getKind(nextRawType);
  if (kind !== nextKind) {
    return false;
  }
  switch (kind) {
    case 'function': {
      latestRawFunctions.set(id, nextRawType);
      return true;
    }
    case 'memo': {
      return accept(type.type, nextRawType.type, id);
    }
    default: {
      return false;
    }
  }
}

window.__assign = function(webpackModule, localId, nextRawType) {
  webpackModule.hot.accept();
  webpackModule.hot.dispose(() => {
    setTimeout(() => _invalidate());
  });
  const id = webpackModule.i + '$' + localId;
  let type = storage.get(id);
  if (!accept(type, nextRawType, id)) {
    type = init(nextRawType, id);
    storage.set(id, type);
  }
  return type;
};
