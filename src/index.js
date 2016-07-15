import React from 'react';
import { render } from 'react-dom';
import App from './App';

const rootEl = document.createElement('div');
document.body.appendChild(rootEl);
render(<App />, rootEl);
