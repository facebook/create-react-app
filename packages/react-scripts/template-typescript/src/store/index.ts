import { combineReducers } from "redux";
import { routerReducer } from 'react-router-redux'
import application from './application/reducers'

export const allReducers = combineReducers({
	application,
	routing: routerReducer,
})

export type IAppState = ReturnType<typeof allReducers>
