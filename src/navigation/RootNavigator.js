/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Two main purposes:
 *
 * rootNavigatorRef: This is a ref created that is set as a reference to the
 * main root navigator, in main.js. This is the main navigator of the entire app.
 *
 * RootNavigator: An export object of functions which control the main navigator which
 * can be imported and used anywhere.
 */

import React from 'react';
import { StackActions } from '@react-navigation/native';

export const rootNavigatorRef = React.createRef();

const navigate = (screenName, screenProps) =>
  rootNavigatorRef.current?.navigate(screenName, screenProps);

const replace = (screenName, screenProps) =>
  rootNavigatorRef.current?.dispatch(StackActions.replace(screenName, screenProps));

const goBack = () => rootNavigatorRef.current?.goBack();

const canGoBack = () => !!rootNavigatorRef.current?.canGoBack();

const getCurrentRouteName = () => {
  if (!rootNavigatorRef.current?.getRootState()) return '';

  const routes = rootNavigatorRef.current?.getRootState()?.routes ?? [];

  return routes[routes.length - 1]?.name ?? '';
};

const prevRouteName = () => {
  if (!rootNavigatorRef.current?.getRootState()) return '';

  const routes = rootNavigatorRef.current?.getRootState()?.routes ?? [];

  return routes[routes.length - 2]?.name ?? '';
};

export const RootNavigator = {
  navigate,
  replace,
  goBack,
  canGoBack,
  getCurrentRouteName,
  prevRouteName,
};
