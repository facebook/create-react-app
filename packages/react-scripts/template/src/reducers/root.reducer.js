// @flow
import { combineReducers } from 'redux';

import network from 'reducers/network.reducer';
import localization from 'reducers/localization.reducer'; // TODO: remove if no localization
import sample from 'reducers/sample.reducer';

export default combineReducers({
  network,
  localization, // TODO: remove if no localization
  sample
});
