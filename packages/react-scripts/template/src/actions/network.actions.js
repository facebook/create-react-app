// @flow
import type { ActionCreator } from 'types/redux.types';

export const START_NETWORK: string = '[network] Start';
export const END_NETWORK: string = '[network] End';

export const startNetwork: ActionCreator = (label: string) => ({
  type: START_NETWORK,
  payload: {
    label,
  },
});

export const endNetwork: ActionCreator = (label: string) => ({
  type: END_NETWORK,
  payload: {
    label,
  },
});
