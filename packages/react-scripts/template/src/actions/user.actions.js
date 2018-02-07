// @flow
import type { ActionCreator } from 'types/redux.types';

export const SET_TOKEN = '[user] Set Token';

export const setUserToken: ActionCreator = (token: string) => ({
  type: SET_TOKEN,
  payload: {
    token
  }
});
