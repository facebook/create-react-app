import 'core-js/es6/map';
import 'core-js/es6/set';
import 'weakmap-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './polyfills';

export * from './components';
export * from './utils';

export default function({ config = {}, routes = [] }) {
  ReactDOM.render(
    React.createElement(App, { config, routes }),
    document.getElementById('root')
  );
}
