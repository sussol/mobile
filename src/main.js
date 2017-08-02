/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { Client as BugsnagClient } from 'bugsnag-react-native';

import { MSupplyMobileApp } from './mSupplyMobileApp';
import { reducers } from './reducers';

const bugsnagClient = new BugsnagClient(); // eslint-disable-line no-unused-vars

const store = createStore(
  reducers,
  {},
  applyMiddleware(thunk),
);

function App() {
  return (
    <Provider store={store}>
      <MSupplyMobileApp />
    </Provider>
  );
}

AppRegistry.registerComponent('mSupplyMobile', () => App);
