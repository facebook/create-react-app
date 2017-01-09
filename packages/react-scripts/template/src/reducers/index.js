import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
  routing: routerReducer,
  form: formReducer,
});

export default rootReducer;
