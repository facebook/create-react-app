import React from 'react';
import { add } from './assets/add.wasm';
console.log(add);

export default () => <span id="wasm-inclusion">{add(1, 9)}</span>;
