// @flow
import { set } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import { Action } from 'types/redux.types';

import * as AT from 'actions/localization.actions';

export type LocalizationState = {|
  locale: string,
|};

const initialState: LocalizationState = {
  locale: 'en-US',
};

const localizationReducer = handleActions(
  {
    [AT.SET_LOCALE]: (
      state: LocalizationState,
      { payload: { locale } }: Action
    ): LocalizationState => set('locale', locale, state),
  },
  initialState
);

export default localizationReducer;
