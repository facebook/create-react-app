import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

export default function ({element}) {
  if (element) {
    ReactDOM.render(<App />, element);
  } else {
    console.error('Cant render to nowhere');
  }
};