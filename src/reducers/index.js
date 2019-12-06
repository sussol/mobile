import { combineReducers } from 'redux';
import NavigationReducer from './NavigationReducer';
import SyncReducer from './SyncReducer';
import { PagesReducer } from './PagesReducer';
import { ModulesReducer } from './ModulesReducer';
import { UserReducer } from './UserReducer';

export default combineReducers({
  user: UserReducer,
  nav: NavigationReducer,
  sync: SyncReducer,
  pages: PagesReducer,
  modules: ModulesReducer,
});
