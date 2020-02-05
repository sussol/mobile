/* eslint-disable import/no-named-as-default */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { Stepper } from './Stepper';
import { TabNavigator } from './TabNavigator';
import DataTablePageView from './DataTablePageView';

import { WizardActions } from '../actions/WizardActions';
import { selectCurrentTab } from '../selectors/wizard';

import { PAGE_CONTENT_PADDING_HORIZONTAL } from '../globalStyles/pageStyles';
import { BACKGROUND_COLOR, BLUE_WHITE, SHADOW_BORDER } from '../globalStyles/colors';

/**
 * Layout component for a Tracker and TabNavigator, displaying steps
 * to completion for completion. See TabNavigator and StepsTracker
 * for individual component implementation.
 */
const WizardComponent = ({ tabs, titles, currentTab, switchTab }) => (
  <View style={localStyles.container}>
    <View style={localStyles.stepperContainer}>
      <Stepper
        numberOfSteps={tabs.length}
        currentStep={currentTab}
        onPress={switchTab}
        titles={titles}
      />
    </View>
    <DataTablePageView>
      <TabNavigator tabs={tabs} currentTabIndex={currentTab} />
    </DataTablePageView>
  </View>
);

const localStyles = StyleSheet.create({
  container: { backgroundColor: BACKGROUND_COLOR, flex: 1 },
  stepperContainer: {
    backgroundColor: BLUE_WHITE,
    borderColor: SHADOW_BORDER,
    marginBottom: 2,
    marginHorizontal: PAGE_CONTENT_PADDING_HORIZONTAL,
  },
});

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
