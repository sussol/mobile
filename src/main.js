/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorHandler } from 'redux-persist-error-handler';

import { name as appName } from '../app.json';
import { store, persistedStore } from './Store';

import MSupplyMobileApp from './mSupplyMobileApp';

function App() {
  return (
    <ErrorHandler persistedStore={persistedStore}>
      <Provider store={store}>
        <NavigationContainer>
          <MSupplyMobileApp />
        </NavigationContainer>
      </Provider>
    </ErrorHandler>
  );
}

YellowBox.ignoreWarnings(['Setting a timer']);
AppRegistry.registerComponent(appName, () => App);
