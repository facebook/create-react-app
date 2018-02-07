// @flow
import type { ActionCreator } from 'types/redux.types';

export const SET_LOCALE: string = '[localization] Set Locale';

export const setLocalization: ActionCreator = (locale: string) => ({
  type: SET_LOCALE,
  payload: {
    locale,
  },
});
