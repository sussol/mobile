import { combineReducers } from 'redux';
import NavigationReducer from './NavigationReducer';
import SyncReducer from './SyncReducer';
import { PagesReducer } from './PagesReducer';

export default combineReducers({
  nav: NavigationReducer,
  sync: SyncReducer,
  pages: PagesReducer,
});
