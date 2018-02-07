// @flow
import { set } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import * as USER from 'actions/user.actions';
import { Action } from 'types/redux.types';

export type UserState = {|
  token: string | null
|};

const initialState: UserState = {
  token: null
};

const userReducer = handleActions(
  {
    [USER.SET_TOKEN]: (state: UserState, { payload: { token } }: Action): UserState =>
      set('token', token, state)
  },
  initialState
);

export default userReducer;
