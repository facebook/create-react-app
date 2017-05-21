import React from 'react';
import logo from './logo.svg';

// TODO: Babel transform that does this
// in files that only export what appears to be
// functional components.
window.__Logo__ = function __Logo__(props) {
  return (
    <div className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <h2>Welcome to React?</h2>
      {props.children}
    </div>
  );
};

// TODO: generate this
try {
  Object.defineProperty(window.__Logo__, 'name', { value: 'Logo' });
} catch (err) {
  // ignore
}
export default function Logo() {
  return window.__Logo__.apply(this, arguments);
}
// The accept dance.
// TODO: generate it for each module that looks like a functional component.
if (!module.hot.data) {
  // Always accept first update
  module.hot.accept();
} else {
  // Defer updating next updates until we know if they threw
  module.hot.data.acceptNext = () => module.hot.accept();
}
module.hot.dispose(data => {
  window.__enqueueForceUpdate(() => {
    // Only accept next if we haven't crashed
    data.acceptNext();
  });
});
