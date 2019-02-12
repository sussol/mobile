/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { combineReducers } from 'redux';

import { reducer as appReducer } from './navigation';
import { reducer as syncReducer } from './sync';

export default combineReducers({
  nav: appReducer,
  sync: syncReducer,
});
