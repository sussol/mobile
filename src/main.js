/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import React from 'react';
import { AppRegistry, YellowBox, BackHandler } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorHandler } from 'redux-persist-error-handler';

import { name as appName } from '../app.json';
import { store, persistedStore } from './Store';
import { backHandler, rootNavigatorRef } from './navigation';

import MSupplyMobileApp from './mSupplyMobileApp';

const App = () => {
  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backHandler(store));
    return () => BackHandler.removeEventListener('hardwareBackPress', backHandler(store));
  }, []);

  return (
    <ErrorHandler persistedStore={persistedStore}>
      <Provider store={store}>
        <NavigationContainer ref={rootNavigatorRef}>
          <MSupplyMobileApp />
        </NavigationContainer>
      </Provider>
    </ErrorHandler>
  );
};

YellowBox.ignoreWarnings(['Setting a timer']);

AppRegistry.registerComponent(appName, () => App);
