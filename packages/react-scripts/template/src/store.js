import { applyMiddleware, combineReducers, createStore } from 'redux';
import { reducer as formReducer } from 'redux-form';
import thunk from 'redux-thunk';

// temp reducer to be removed
const tempReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
// shape the state structure
export const rootReducer = {
  tempReducer,
  form: formReducer,
};

//Add custom middleware here
export const featureMiddleware = [];

//Add core middleware here
const coreMiddleware = [thunk];

// Compose all middlewares
const middlewares = applyMiddleware(...featureMiddleware, ...coreMiddleware);
// create and configure the store
const store = createStore(combineReducers(rootReducer), {}, middlewares);
export default store;
