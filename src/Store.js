/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import AsyncStorage from '@react-native-community/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import { navigationMiddleware } from './navigation';
import reducers from './reducers';

const persistConfig = {
  keyPrefix: '',
  key: 'root',
  storage: AsyncStorage,
  blacklist: [
    'pages',
    'user',
    'prescription',
    'patient',
    'finalise',
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

const store = createStore(persistedReducer, {}, applyMiddleware(thunk, navigationMiddleware));

const persistedStore = persistStore(store);

export { store, persistedStore };
