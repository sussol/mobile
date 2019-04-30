/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { combineReducers } from 'redux';

import { reducer as navigation } from './navigation';
import { reducer as sync } from './sync';

export const reducers = combineReducers({
  navigation,
  sync,
});

export default reducers;
