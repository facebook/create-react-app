import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxPromiseMiddleware from 'redux-promise-middleware';

import reducers from '../reducers';
import axios from 'axios';

export default function configureStore() {
  let composeEnhancers;
  if (process.env.NODE_ENV !== 'production')
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  else composeEnhancers = compose;

  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(reduxThunk, reduxPromiseMiddleware()))
  );

  return store;
}
