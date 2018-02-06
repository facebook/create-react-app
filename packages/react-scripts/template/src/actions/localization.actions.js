// @flow
import type { ActionCreator } from 'types/redux.types';

export const SET_LOCALIZATION: string = 'SET_LOCALIZATION';

export const setLocalization: ActionCreator = (locale: string) => ({
  type: SET_LOCALIZATION,
  payload: {
    locale,
  },
});
