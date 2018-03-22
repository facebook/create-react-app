// @flow
// TODO: remove this file if no localization is needed
import { get, set } from 'lodash/fp';
import { handleActions } from 'redux-actions';

import type { Action } from 'types/redux.types';

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
      action: Action
    ): LocalizationState => set('locale', get('payload.locale', action), state),
  },
  initialState
);

export default localizationReducer;
