import React from 'react';

let HotContext = React.createContext();
let _invalidate;
export function HotContainer({ children }) {
  const [inc, setInc] = React.useState(0);
  _invalidate = () => setInc(c => c + 1);
  return <HotContext.Provider value={inc}>{children}</HotContext.Provider>;
}

let CurrentOwner =
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
function readContext(Ctx) {
  CurrentOwner.currentDispatcher.readContext(Ctx);
}

let idToPersistentType = new Map();
let idToRawFunction = new Map();
let proxies = new WeakSet();

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
    } else if (type.$$typeof === Symbol.for('react.lazy')) {
      return 'lazy';
    } else if (type.$$typeof === Symbol.for('react.forward_ref')) {
      return 'forward_ref';
    }
  }
  return 'other';
}

function init(rawType, id) {
  let kind = getKind(rawType);
  switch (kind) {
    case 'function': {
      if (proxies.has(rawType)) {
        return rawType;
      }
      idToRawFunction.set(id, rawType);
      const proxy = new Proxy(rawType, {
        apply(target, thisArg, args) {
          let ret = idToRawFunction.get(id).apply(null, args);
          readContext(HotContext);
          return ret;
        },
      });
      proxies.add(proxy);
      return proxy;
    }
    case 'memo': {
      rawType.type = init(rawType.type, id);
      return rawType;
    }
    case 'lazy': {
      return rawType;
    }
    case 'forward_ref': {
      rawType.render = init(rawType.render, id);
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
      idToRawFunction.set(id, nextRawType);
      return true;
    }
    case 'memo': {
      return accept(type.type, nextRawType.type, id);
    }
    case 'forward_ref': {
      return accept(type.render, nextRawType.render, id);
    }
    case 'lazy': {
      return true;
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
  let type = idToPersistentType.get(id);
  if (!accept(type, nextRawType, id)) {
    type = init(nextRawType, id);
    idToPersistentType.set(id, type);
  }
  return type;
};
