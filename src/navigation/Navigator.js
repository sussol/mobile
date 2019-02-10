/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { StackNavigator as createStackNavigator } from 'react-navigation';

import { PAGES } from '../pages';

const routes = {};
// Add all pages to navigation routes.
Object.entries(PAGES).forEach(([routeName, page]) => {
  routes[routeName] = { screen: page };
});

const config = {
  initialRouteName: 'root',
  headerMode: 'none',
};

export const Navigator = createStackNavigator(routes, config);

export default Navigator;
