import { combineReducers } from 'redux'
import initState from './init'
import { appReducers } from '../../../src/store/reducers'
import rootReducer from '../../../src/store/rootReducer'

const appReducer = combineReducers({
  ...appReducers
})

export default (state, action) => rootReducer(appReducer, initState, state, action)
