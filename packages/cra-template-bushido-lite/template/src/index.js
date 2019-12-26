import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// Import css file from bushido-strap for global style overhaul
import 'bushido-strap/css/main.css';

// Keep this puppy here for later!
import * as serviceWorker from './serviceWorker';

import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
