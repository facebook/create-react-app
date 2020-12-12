import { COUNTER } from '../../../configs/c2Mods';
import state from './state';
import * as computed from './computed';
import * as reducer from './reducer';

export default {
  [COUNTER]: {
    state,
    computed,
    reducer,
  },
};
