import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// By default we make sure that no service worker is registered. If you would
// like to enable service worker uncomment the call to serviceWorker.register()
// and comment out the call to serviceWorker.unregister().
// See http://bit.ly/2vJdu84 for more information.

// serviceWorker.register();
serviceWorker.unregister();
