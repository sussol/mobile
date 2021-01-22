/* eslint-disable import/no-named-as-default */
/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';

import { Stepper } from './Stepper';
import { TabNavigator } from './TabNavigator';
import DataTablePageView from './DataTablePageView';

import { WizardActions } from '../actions/WizardActions';
import { selectCurrentTab } from '../selectors/wizard';

import { BACKGROUND_COLOR, SHADOW_BORDER } from '../globalStyles/colors';

/**
 * Layout component for a Tracker and TabNavigator, displaying steps
 * to completion for completion. See TabNavigator and StepsTracker
 * for individual component implementation.
 */
const WizardComponent = ({
  captureUncaughtGestures,
  tabs,
  currentTab,
  switchTab,
  useNewStepper,
}) => {
  const titles = useMemo(() => tabs.map(tab => tab.title), [tabs]);

  return (
    <View style={localStyles.container}>
      <DataTablePageView captureUncaughtGestures={captureUncaughtGestures}>
        <View style={localStyles.stepperContainer}>
          <Stepper
            useNewStepper={useNewStepper}
            numberOfSteps={tabs.length}
            currentStep={currentTab}
            onPress={switchTab}
            titles={titles}
          />
        </View>

        <TabNavigator tabs={tabs} currentTabIndex={currentTab} />
      </DataTablePageView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: { backgroundColor: BACKGROUND_COLOR, flex: 1 },
  stepperContainer: {
    marginBottom: 2,
    borderBottomColor: SHADOW_BORDER,
    borderBottomWidth: 1,
  },
});

WizardComponent.defaultProps = {
  useNewStepper: false,
  captureUncaughtGestures: true,
};

WizardComponent.propTypes = {
  tabs: PropTypes.array.isRequired,
  switchTab: PropTypes.func.isRequired,
  currentTab: PropTypes.number.isRequired,
  useNewStepper: PropTypes.bool,
  captureUncaughtGestures: PropTypes.bool,
};

const mapStateToProps = state => {
  const currentTab = selectCurrentTab(state);
  return { currentTab };
};

const mapDispatchToProps = dispatch => ({
  switchTab: tab => dispatch(WizardActions.switchTab(tab)),
});

export const Wizard = connect(mapStateToProps, mapDispatchToProps)(WizardComponent);
