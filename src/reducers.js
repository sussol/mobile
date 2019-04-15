/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { combineReducers } from 'redux';

import { navigationReducer } from './navigation';
import { syncReducer } from './sync';

export default combineReducers({
  nav: navigationReducer,
  sync: syncReducer,
});
