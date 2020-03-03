import { createStackNavigator } from '@react-navigation/stack';

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

export default createStackNavigator(routes, config);
