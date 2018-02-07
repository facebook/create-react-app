// @flow
import { createSelector } from 'reselect';

import type { State } from 'types/redux.types';
import type { NetworkState } from 'reducers/network.reducer';

const networkSelector = (state: State): NetworkState => state.network;

export const isLoadingSelector = (state: NetworkState, label: string): boolean =>
  createSelector(
    networkSelector,
    (network: NetworkState) => typeof network[label] !== 'undefined' && network[label] !== 0
  )(state);
