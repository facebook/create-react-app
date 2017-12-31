import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import sentry from './sentry';
import registerServiceWorker from './register-service-worker';
import App from './app';

sentry();

if (process.env.NODE_ENV === 'production') {
  console.log('BUILD NUM : ', process.env.BUILD_NUM); // eslint-disable-line no-console
}
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
