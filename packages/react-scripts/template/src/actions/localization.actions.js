// @flow
import type { ActionCreator } from 'types/redux.types';

export const SET: string = '[localization] Set';

export const setLocalization: ActionCreator = (locale: string) => ({
  type: SET,
  payload: {
    locale,
  },
});
