import { combineReducers } from "redux";
import { counter } from "./counter";

// Using combine reducers to break up reducers into different files
export default combineReducers({
  counter
});
