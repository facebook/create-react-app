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

      let abandonedHooks = [];
      let isAbandoningHooks = false;
      let previousHooks = [];
      const NEVER = {};
      const NOOP = {};

      const proxy = new Proxy(rawType, {
        apply(target, thisArg, args) {
          readContext(HotContext);

          let realDispatcher = CurrentOwner.currentDispatcher;
          let freshRawType = idToRawFunction.get(id);
          let currentHooks = [];

          function callNoopHook([hook, inputLength]) {
            let inputs;
            if (inputLength) {
              inputs = new Array(inputLength).fill(NOOP);
            }
            switch (hook) {
              case realDispatcher.useState:
                realDispatcher.useState();
                break;
              case realDispatcher.useRef:
                realDispatcher.useRef();
                break;
              case realDispatcher.useReducer:
                realDispatcher.useReducer(state => state);
                break;
              case realDispatcher.useLayoutEffect:
                realDispatcher.useLayoutEffect(() => {}, inputs);
                break;
              case realDispatcher.useEffect:
                realDispatcher.useEffect(() => {}, inputs);
                break;
              case realDispatcher.useMemo:
                realDispatcher.useMemo(() => {}, inputs);
                break;
              case realDispatcher.useCallback:
                realDispatcher.useCallback(() => {}, inputs);
                break;
              case realDispatcher.readContext:
              case realDispatcher.useContext:
                break;
              default:
                throw new Error('TODO');
            }
          }

          // Pad left abandoned Hooks
          for (let i = 0; i < abandonedHooks.length; i++) {
            const hook = abandonedHooks[i];
            callNoopHook(hook);
          }

          CurrentOwner.currentDispatcher = new Proxy(realDispatcher, {
            get(target, prop, receiver) {
              const hook = Reflect.get(...arguments);
              return new Proxy(hook, {
                apply(t, thisArg, argumentsList) {
                  let prevHook = previousHooks[currentHooks.length];
                  if (prevHook && prevHook[0] !== hook) {
                    throw new Error('Hook mismatch.');
                  }
                  // TODO: check if type matches up and throw
                  // TODO: reset individual state if primitive type differs
                  switch (hook) {
                    case realDispatcher.useLayoutEffect:
                    case realDispatcher.useEffect:
                    case realDispatcher.useMemo:
                    case realDispatcher.useCallback:
                      {
                        let inputs = argumentsList[1];
                        if (inputs) {
                          if (inputs.length === 0) {
                            // Allows us to clean up if this Hook is removed later.
                            argumentsList[1] = inputs = [NEVER];
                          }
                          currentHooks.push([hook, inputs.length]);
                        } else {
                          currentHooks.push([hook]);
                        }
                      }
                      break;
                    default:
                      currentHooks.push([hook]);
                      break;
                  }
                  return Reflect.apply(t, thisArg, argumentsList);
                },
              });
            },
          });
          let ret;
          try {
            ret = freshRawType.apply(null, args);
            isAbandoningHooks = false;
          } catch (err) {
            if (isAbandoningHooks) {
              isAbandoningHooks = false;
              throw err;
            }
            isAbandoningHooks = true;
          } finally {
            CurrentOwner.currentDispatcher = realDispatcher;
          }

          // Pad right missing Hooks
          for (let i = currentHooks.length; i < previousHooks.length; i++) {
            const hook = previousHooks[i];
            callNoopHook(hook);
            currentHooks.push(hook);
          }

          previousHooks = currentHooks;

          if (isAbandoningHooks) {
            const [, reset] = realDispatcher.useState();
            // Shift Hooks to recover. This leaks memory. Ideallly we'd reset.
            previousHooks.push([realDispatcher.useState]);
            abandonedHooks.push(...previousHooks);
            previousHooks = [];
            reset();
          }

          return (
            <React.Fragment key={abandonedHooks.length}>{ret}</React.Fragment>
          );
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
      const forceRemount =
        nextRawType.toString().indexOf('//!') !== -1 ||
        nextRawType.toString().indexOf('// !') !== -1;
      return !forceRemount;
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
