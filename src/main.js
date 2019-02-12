/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { ErrorHandler } from 'redux-persist-error-handler';
import { Client as BugsnagClient } from 'bugsnag-react-native';
import { name as appName } from '../app.json';
import { store, persistedStore } from './Store';
import MSupplyMobileApp from './mSupplyMobileApp';


const bugsnagClient = new BugsnagClient();

function App() {
  return (
    <ErrorHandler persistedStore={persistedStore}>
      <Provider store={store}>
        <MSupplyMobileApp />
      </Provider>
    </ErrorHandler>
  );
}

AppRegistry.registerComponent(appName, () => App);
