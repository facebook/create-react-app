import { createStore, applyMiddleware, compose } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import reducers from './reducers'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/es/storage' // default: localStorage if web, AsyncStorage if react-native
import initState from './init'

export default function configureStore() {
  let store

  const logger = createLogger({})

  let middlewares = [thunk]

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push(logger) // DEV middlewares
  }

  const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
      : compose

  const enhancer = composeEnhancers(applyMiddleware(...middlewares))

  const persistorConfig = {
    key: 'root',
    storage,
    blacklist: ['form', 'connection', 'initialization', 'messaging']
  }

  const reducer = persistReducer(persistorConfig, reducers)

  store = createStore(reducer, initState, enhancer)

  try {
    persistStore(store)
  } catch (e) {}

  return store
}
