import { combineReducers } from 'redux';

import network from 'reducers/network.reducer';
import localization from 'reducers/localization.reducer';

export default combineReducers({
  network,
  localization,
});
