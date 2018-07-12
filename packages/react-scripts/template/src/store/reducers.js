import { combineReducers } from 'redux'
import initState from './init'
import { appReducers } from 'rmw-shell/lib/store/reducers'
import rootReducer from 'rmw-shell/lib/store/rootReducer'

const appReducer = combineReducers({
  ...appReducers
})

export default (state, action) => rootReducer(appReducer, initState, state, action)
