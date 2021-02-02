/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const DEFAULT_TAB_CONFIG = { options: { tabBarVisible: false } };
const Tab = createBottomTabNavigator();

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
  const navigatorRef = useRef(useNavigation());

  // When `currentTabIndex` changes, dispatch an action to trigger a switch on the
  // base navigation component to the passed tab index.
  useEffect(() => navigatorRef.current.navigate(String(currentTabIndex)), [currentTabIndex]);

  return (
    <Tab.Navigator tabBar={() => null}>
      {tabs.map((tab, idx) => (
        <Tab.Screen
          {...DEFAULT_TAB_CONFIG}
          name={`${idx}`}
          key={tab.name}
          component={tab.component}
        />
      ))}
    </Tab.Navigator>
  );
};

TabNavigator.propTypes = {
  tabs: PropTypes.array.isRequired,
  currentTabIndex: PropTypes.number.isRequired,
};
