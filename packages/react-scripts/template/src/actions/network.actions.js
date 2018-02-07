// @flow
import type { ActionCreator } from 'types/redux.types';

export const API: string = '[network] API';
export const START: string = '[network] Start';
export const END: string = '[network] End';

export const startNetwork: ActionCreator = (label: string) => ({
  type: START,
  payload: {
    label,
  },
});

export const endNetwork: ActionCreator = (label: string) => ({
  type: END,
  payload: {
    label,
  },
});
