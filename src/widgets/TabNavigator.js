/* eslint-disable react/forbid-prop-types */
import React, { useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createAppContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { NavigationActions } from 'react-navigation';

const getTabNavigator = (routes, options) => {
  const TabNavigator = createBottomTabNavigator(routes, options);
  const Container = createAppContainer(TabNavigator);
  return Container;
};

const DEFAULT_TAB_CONFIG = { navigationOptions: { tabBarVisible: false } };

/**
 * Simple TabNavigator component managing lazily loaded
 * tabs of components. Slightly different from a regular tab navigator:
 * Managed declaratively through passing props rather than  imperatively
 * using functions on the navigation ref.
 *
 * @prop {Array} tabs             An array of components for each tab.
 * @prop {Number} currentTabIndex The index of the tab to show.
 */
export const TabNavigator = ({ tabs, currentTabIndex }) => {
  const navigatorRef = useRef(React.createRef());

  // Create the tab navigator component dynamically. Will not re-calculate until unmounted.
  const Container = useMemo(() => {
    const tabsConfig = tabs.reduce(
      (acc, value, index) => ({ ...acc, [index]: { ...DEFAULT_TAB_CONFIG, screen: value } }),
      {}
    );
    const defaultNavigationConfig = { initialRouteName: String(currentTabIndex) };
    return getTabNavigator(tabsConfig, defaultNavigationConfig);
  }, []);

  // When `currentTabIndex` changes, trigger navigation to the correct tab. Dispatching will
  useEffect(() => {
    const navigationAction = NavigationActions.navigate({ routeName: String(currentTabIndex) });
    navigatorRef.current.dispatch(navigationAction);
  }, [currentTabIndex]);

  return <Container ref={navigatorRef} />;
};

TabNavigator.propTypes = {
  tabs: PropTypes.array.isRequired,
  currentTabIndex: PropTypes.number.isRequired,
};
