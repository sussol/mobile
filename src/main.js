/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

/* eslint-disable no-unused-vars */

import React from 'react';
import { AppRegistry, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { ErrorHandler } from 'redux-persist-error-handler';
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { MSupplyMobileApp } from './mSupplyMobileApp';
import { reducers } from './reducers';

const bugsnagClient = new BugsnagClient();

const store = createStore(
  reducers,
  {},
  applyMiddleware(thunk),
);

// Persist the redux store. We have to blacklist navigation because some of the props we pass
// around via redux are enormous, possibly infinitely nested realm objects, which can't be quickly
// serialised and persisted to AsyncStorage
const persistedStore = persistStore(store, { blacklist: ['navigation'], storage: AsyncStorage });

function App() {
  return (
    <ErrorHandler persistedStore={persistedStore}>
      <Provider store={store}>
        <MSupplyMobileApp />
      </Provider>
    </ErrorHandler>
  );
}

AppRegistry.registerComponent('mSupplyMobile', () => App);
