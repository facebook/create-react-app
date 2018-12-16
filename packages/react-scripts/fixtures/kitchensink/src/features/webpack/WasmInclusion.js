import React from 'react';
import('./assets/add.wasm')
  .then(console.log)
  .catch(console.log);

export default () => <span id="wasm-inclusion" />;
