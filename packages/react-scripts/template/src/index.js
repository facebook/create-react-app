import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker, {
  unregister as unregisterServiceWorker,
} from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// By default we make sure that no service worker is registered. If you would
// like to enable service worker uncomment the call to registerServiceWorker()
// and comment out the call to unregisterServiceWorker().
// See http://bit.ly/2vJdu84 for more information.

// registerServiceWorker();
unregisterServiceWorker();
