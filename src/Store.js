/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import AsyncStorage from '@react-native-community/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import reducers from './reducers';
import { RootNavigator } from './navigation';

const persistConfig = {
  keyPrefix: '',
  key: 'root',
  storage: AsyncStorage,
  blacklist: [
    'pages',
    'user',
    'prescription',
    'patient',
    'form',
    'prescriber',
    'wizard',
    'payment',
    'insurance',
    'dashboard',
    'dispensary',
    'modules',
    'supplierCredit',
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

/**
 * Simple middleware which intercepts navigation actions and calls a function
 * on the apps root navigator to force navigation.
 *
 * Note: This was added when transitioning from react-navigation v4, where
 * navigation was handled through redux - to v5 where the previous integration
 * method was not possible.
 *
 */
const navigationMiddleware = () => next => action => {
  const { type } = action;

  if (type === 'Navigation/NAVIGATE') {
    const { routeName, params } = action;
    RootNavigator.navigate(routeName, params);
  }
  if (type === 'Navigation/REPLACE') {
    const { routeName, params } = action;
    RootNavigator.replace(routeName, params);
  }

  if (type === 'Navigation/BACK') {
    RootNavigator.goBack();
  }

  next(action);
};

const store = createStore(persistedReducer, {}, applyMiddleware(thunk, navigationMiddleware));

const persistedStore = persistStore(store);

export { store, persistedStore };
