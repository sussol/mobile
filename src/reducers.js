/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { combineReducers } from 'redux';

import { reducer as navigation } from './navigation';
import { reducer as sync } from './sync';

export const reducers = combineReducers({
  navigation,
  sync,
});
