import { combineReducers } from 'redux';
import { actionLoadingReducer } from './loading';

import { reducer as helloReducer } from 'actions/hello';

export default function makeReducer() {
  return combineReducers({
    hello: helloReducer,
    loading: actionLoadingReducer,
  });
}
