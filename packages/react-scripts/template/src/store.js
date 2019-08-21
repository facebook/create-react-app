import { applyMiddleware, combineReducers, createStore } from 'redux';
import { reducer as formReducer } from 'redux-form';
import thunk from 'redux-thunk';

// temp reducer to be removed
//Once real reducers added you can delete this
const tempReducer = (state = {}, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
// shape the state structure
const rootReducer = combineReducers({
  tempReducer,
  form: formReducer,
});

//Add custom middleware here
const featureMiddleware = [];

/**
 * Initialize the redux store
 * Create the store
 * Applying extra arguments
 * To pass further arguments please config the function
 * @param initialState  {Object}  initial state for store
 * @param api {Object}  API class for api middleware
 * @return {Store<any, AnyAction> & {dispatch: any}}
 */
export default (initialState = {}, api) =>
    createStore(rootReducer, initialState, applyMiddleware(...featureMiddleware, thunk.withExtraArgument(api)));
