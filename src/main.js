/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';

import Realm from 'realm';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import { ErrorHandler } from 'redux-persist-error-handler';

import { AppRegistry, AsyncStorage } from 'react-native';

// import { Client as BugsnagClient } from 'bugsnag-react-native';

import { MSupplyMobileApp } from './mSupplyMobileApp';
import { reducers } from './reducers';

// const bugsnagClient = new BugsnagClient();

const persistConfig = {
  keyPrefix: '',
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['navigation'],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStore(persistedReducer, {}, applyMiddleware(thunk));

const persistedStore = persistStore(store);

function App() {
  Realm.copyBundledRealmFiles();
  return (
    <ErrorHandler persistedStore={persistedStore}>
      <Provider store={store}>
        <MSupplyMobileApp />
      </Provider>
    </ErrorHandler>
  );
}

AppRegistry.registerComponent('mSupplyMobile', () => App);
