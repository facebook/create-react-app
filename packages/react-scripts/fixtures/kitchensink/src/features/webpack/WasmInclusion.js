import React from 'react';
import * as wasm from './assets/add.wasm';
console.log(wasm);

export default () => <span id="wasm-inclusion">{wasm.add(1, 10)}</span>;
