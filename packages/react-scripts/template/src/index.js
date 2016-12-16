import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';
import App from './App';
import './index.css';

if (typeof window !== 'undefined') {
  ReactDOM.render(<App />, document.getElementById('root'));
}

export default function render() {
  return renderToString(<App />);
}
