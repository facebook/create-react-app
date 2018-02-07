import { combineReducers } from 'redux';

import network from 'reducers/network.reducer';
import user from 'reducers/user.reducer';
import localization from 'reducers/localization.reducer';
import sample from 'reducers/sample.reducer';

export default combineReducers({
  network,
  user,
  localization,
  sample
});
