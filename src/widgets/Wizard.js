/* eslint-disable import/no-named-as-default */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Stepper } from './Stepper';
import { TabNavigator } from './TabNavigator';
import DataTablePageView from './DataTablePageView';

import { WizardActions } from '../actions/WizardActions';
import { selectCurrentTab } from '../selectors/wizard';

/**
 * Layout component for a Tracker and TabNavigator, displaying steps
 * to completion for completion. See TabNavigator and StepsTracker
 * for individual component implementation.
 */
const WizardComponent = ({ tabs, titles, currentTab, switchTab }) => (
  <DataTablePageView>
    <Stepper
      numberOfSteps={tabs.length}
      currentStep={currentTab}
      onPress={switchTab}
      titles={titles}
    />
    <TabNavigator tabs={tabs} currentTabIndex={currentTab} />
  </DataTablePageView>
);

WizardComponent.propTypes = {
  tabs: PropTypes.array.isRequired,
  titles: PropTypes.array.isRequired,
  switchTab: PropTypes.func.isRequired,
  currentTab: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
  const currentTab = selectCurrentTab(state);
  return { currentTab };
};

const mapDispatchToProps = dispatch => ({
  switchTab: tab => dispatch(WizardActions.switchTab(tab)),
});

export const Wizard = connect(mapStateToProps, mapDispatchToProps)(WizardComponent);
