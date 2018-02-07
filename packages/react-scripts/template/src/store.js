import { createStore, compose, applyMiddleware } from 'redux';

import rootReducer from 'reducers/root.reducer';
import apiMiddleware from 'middlewares/api.middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middlewares = [apiMiddleware];

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(...middlewares)));

export default store;
