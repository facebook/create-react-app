import { createStore } from 'redux';
import makeReducer from './reducer';
import makeEnhancers from './middleware';

export function makeStore(initialState = {}) {
  return createStore(makeReducer(), initialState, makeEnhancers());
}
