import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './register-service-worker';
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

registerServiceWorker();
