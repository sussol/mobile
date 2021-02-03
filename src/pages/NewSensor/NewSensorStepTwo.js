/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import { BreachConfigRow } from './BreachConfigRow';
import { Paper, FlexRow, PageButton, Spacer } from '../../widgets';
import { AfterInteractions } from '../../widgets/AfterInteractions';

import { SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { TemperatureBreachConfigActions, WizardActions } from '../../actions';
import { goBack } from '../../navigation/actions';
// eslint-disable-next-line max-len
import {
  selectNewConfigsByType,
  selectNewConfigThresholds,
} from '../../selectors/Entities/temperatureBreachConfig';
import { SECONDS } from '../../utilities/constants';

export const NewSensorStepTwoComponent = ({
  nextTab,
  previousTab,
  exit,
  hotConsecutiveConfig,
  coldCumulativeConfig,
  coldConsecutiveConfig,
  hotCumulativeConfig,
  updateDuration,
  updateTemperature,
  coldConsecutiveThreshold,
  hotConsecutiveThreshold,
  hotCumulativeThreshold,
  coldCumulativeThreshold,
}) => (
  <TabContainer>
    <Paper headerText={vaccineStrings.new_sensor_step_two_title}>
      <AfterInteractions placeholder={null}>
        <BreachConfigRow
          threshold={hotConsecutiveThreshold}
          type="HOT_CONSECUTIVE"
          {...hotConsecutiveConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
          containerStyle={localStyles.paperContentRow}
        />
        <BreachConfigRow
          threshold={coldConsecutiveThreshold}
          type="COLD_CONSECUTIVE"
          {...coldConsecutiveConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
          containerStyle={localStyles.paperContentRow}
        />
        <BreachConfigRow
          threshold={hotCumulativeThreshold}
          type="HOT_CUMULATIVE"
          {...hotCumulativeConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
          containerStyle={localStyles.paperContentRow}
        />
        <BreachConfigRow
          threshold={coldCumulativeThreshold}
          type="COLD_CUMULATIVE"
          {...coldCumulativeConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
          containerStyle={localStyles.paperContentRow}
        />
      </AfterInteractions>
    </Paper>

    <FlexRow flex={1} justifyContent="flex-end" alignItems="flex-end">
      <View style={{ marginRight: 'auto' }}>
        <PageButton text={buttonStrings.back} onPress={previousTab} />
      </View>

      <PageButton text={buttonStrings.cancel} onPress={exit} />
      <Spacer space={20} />
      <PageButton
        text={buttonStrings.next}
        style={{ backgroundColor: SUSSOL_ORANGE }}
        textStyle={{ color: WHITE }}
        onPress={nextTab}
      />
    </FlexRow>
  </TabContainer>
);

const localStyles = StyleSheet.create({
  paperContentRow: {
    padding: 8,
  },
});

const stateToProps = state => {
  const {
    HOT_CONSECUTIVE: hotConsecutiveConfig,
    COLD_CONSECUTIVE: coldConsecutiveConfig,
    HOT_CUMULATIVE: hotCumulativeConfig,
    COLD_CUMULATIVE: coldCumulativeConfig,
  } = selectNewConfigsByType(state);

  const {
    coldConsecutiveThreshold,
    hotConsecutiveThreshold,
    hotCumulativeThreshold,
    coldCumulativeThreshold,
  } = selectNewConfigThresholds(state);

  return {
    hotConsecutiveConfig,
    coldCumulativeConfig,
    coldConsecutiveConfig,
    hotCumulativeConfig,
    coldConsecutiveThreshold,
    hotConsecutiveThreshold,
    hotCumulativeThreshold,
    coldCumulativeThreshold,
  };
};

const dispatchToProps = dispatch => {
  const nextTab = () => dispatch(WizardActions.nextTab());
  const previousTab = () => dispatch(WizardActions.previousTab());
  const exit = () => dispatch(goBack());
  const updateDuration = (type, value) =>
    dispatch(
      TemperatureBreachConfigActions.updateNewConfig(type, 'duration', value * SECONDS.ONE_MINUTE)
    );
  const updateTemperature = (type, value) => {
    const field = type.includes('HOT') ? 'minimumTemperature' : 'maximumTemperature';
    dispatch(TemperatureBreachConfigActions.updateNewConfig(type, field, value));
  };

  return { nextTab, previousTab, exit, updateDuration, updateTemperature };
};

NewSensorStepTwoComponent.defaultProps = {
  hotConsecutiveConfig: {},
  coldCumulativeConfig: {},
  coldConsecutiveConfig: {},
  hotCumulativeConfig: {},
};

NewSensorStepTwoComponent.propTypes = {
  nextTab: PropTypes.func.isRequired,
  previousTab: PropTypes.func.isRequired,
  exit: PropTypes.func.isRequired,
  hotConsecutiveConfig: PropTypes.object,
  coldCumulativeConfig: PropTypes.object,
  coldConsecutiveConfig: PropTypes.object,
  hotCumulativeConfig: PropTypes.object,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  coldConsecutiveThreshold: PropTypes.number.isRequired,
  hotConsecutiveThreshold: PropTypes.number.isRequired,
  hotCumulativeThreshold: PropTypes.number.isRequired,
  coldCumulativeThreshold: PropTypes.number.isRequired,
};

export const NewSensorStepTwo = connect(stateToProps, dispatchToProps)(NewSensorStepTwoComponent);
