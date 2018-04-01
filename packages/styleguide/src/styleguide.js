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
