// @flow
import { set } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import * as AT from 'actions/network.actions';
import { Action } from 'types/redux.types'; // TODO: from redux?

export type NetworkState = {};

const initialState: NetworkState = {};

const networkReducer = handleActions(
  {
    [AT.START_NETWORK]: (state: NetworkState, { payload: { label } }: Action): NetworkState =>
      set(label, state[label] ? state[label] + 1 : 1, state),

    [AT.END_NETWORK]: (state: NetworkState, { payload: { label } }: Action): NetworkState =>
      set(label, state[label] ? state[label] - 1 : 0, state),
  },
  initialState
);

export default networkReducer;
