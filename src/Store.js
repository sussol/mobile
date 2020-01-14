import AsyncStorage from '@react-native-community/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createReactNavigationReduxMiddleware } from 'react-navigation-redux-helpers';
import reducers from './reducers';

// Create middleware and connect
const appNavigatorMiddleware = createReactNavigationReduxMiddleware(state => state.nav, 'root');

const persistConfig = {
  keyPrefix: '',
  key: 'root',
  storage: AsyncStorage,
  blacklist: [
    'nav',
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
  ],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStore(persistedReducer, {}, applyMiddleware(thunk, appNavigatorMiddleware));

const persistedStore = persistStore(store);

export { store, persistedStore };
