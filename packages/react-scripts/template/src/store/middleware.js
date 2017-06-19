import { compose, applyMiddleware } from 'redux';
import { actionLoadingMiddleware } from './loading';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise';

let composeEnhancers = compose;

if (typeof __DEV__ !== 'undefined' && typeof __TEST__ === 'undefined') {
  /* eslint-disable no-underscore-dangle */
  if (global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
}

export const middlewares = [actionLoadingMiddleware, thunkMiddleware, promiseMiddleware];

export default function makeEnhancers() {
  return composeEnhancers(
    applyMiddleware(actionLoadingMiddleware, thunkMiddleware, promiseMiddleware),
  );
}
