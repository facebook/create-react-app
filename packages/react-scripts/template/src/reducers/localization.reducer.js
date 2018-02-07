// @flow
import { set } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import { Action } from 'types/redux.types';

import * as LOCALIZATION from 'actions/localization.actions';

export type LocalizationState = {|
  locale: string,
|};

const initialState: LocalizationState = {
  locale: 'en-US',
};

const localizationReducer = handleActions(
  {
    [LOCALIZATION.SET]: (
      state: LocalizationState,
      { payload: { locale } }: Action
    ): LocalizationState => set('locale', locale, state),
  },
  initialState
);

export default localizationReducer;
