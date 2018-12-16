import React from 'react';
import { add } from './assets/add.wasm';

export default () => <span id="wasm-inclusion">{add(1, 10)}</span>;
