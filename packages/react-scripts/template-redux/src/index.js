import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

import { BrowserRouter as Router } from 'react-router-dom';

import { App } from './components';
import './index.css';
import * as serviceWorker from './serviceWorker';

const initialState = {
  example: {
    timestamp: Date.now(),
  },
};

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  initialState,
  composeEnhancers(applyMiddleware(thunk, logger))
);

/* eslint-disable react/jsx-filename-extension */
// https://medium.com/@pshrmn/a-simple-react-router-v4-tutorial-7f23ff27adf
render(
  <Provider store={store}>
    <Router basename={process.env.PUBLIC_URL}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
/* eslint-enable react/jsx-filename-extension */

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
