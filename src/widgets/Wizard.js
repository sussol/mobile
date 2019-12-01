/* eslint-disable import/no-named-as-default */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

import { StepsTracker } from './StepsTracker';
import { TabNavigator } from './TabNavigator';
import DataTablePageView from './DataTablePageView';

/**
 * Layout component for a Tracker and TabNavigator, displaying steps
 * to completion for completion. See TabNavigator and StepsTracker
 * for individual component implementation.
 */
export const Wizard = ({ tabs, titles, onPress, currentTabIndex }) => (
  <DataTablePageView>
    <StepsTracker
      numberOfSteps={tabs.length}
      currentStep={currentTabIndex}
      onPress={onPress}
      title={titles[currentTabIndex]}
    />
    <TabNavigator tabs={tabs} currentTabIndex={currentTabIndex} />
  </DataTablePageView>
);

Wizard.propTypes = {
  tabs: PropTypes.array.isRequired,
  titles: PropTypes.array.isRequired,
  onPress: PropTypes.func.isRequired,
  currentTabIndex: PropTypes.number.isRequired,
};
