import { combineReducers } from 'redux';
import NavigationReducer from './NavigationReducer';
import SyncReducer from './SyncReducer';

export default combineReducers({
  nav: NavigationReducer,
  sync: SyncReducer,
});
