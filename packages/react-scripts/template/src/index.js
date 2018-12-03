import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

let setStates = new Map();

window.__enqueueForceUpdate = function(type) {
  console.log('force', type.name);
  const id = type.__hot__id;
  (setStates.get(id) || []).forEach(setState => setState({}));
};

window.__renderHook = function(type) {
  console.log('render', type.name);
  const [, setState] = React.useState();
  React.useLayoutEffect(() => {
    const id = type.__hot__id;
    if (!setStates.has(id)) {
      setStates.set(id, new Set());
    }
    setStates.get(id).add(setState);
    return () => setStates.get(id).delete(setState);
  }, []);
};

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
