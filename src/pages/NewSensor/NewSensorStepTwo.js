import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import { BreachConfigRow } from './BreachConfigRow';
import { Paper, FlexRow, PageButton, Spacer } from '../../widgets';
import { AfterInteractions } from '../../widgets/AfterInteractions';

import { SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { WizardActions } from '../../actions/WizardActions';
import { goBack } from '../../navigation/actions';
// eslint-disable-next-line max-len
import { TemperatureBreachConfigActions } from '../../actions/Entities/TemperatureBreachConfigActions';
import {
  selectNewConfigsByType,
  selectNewConfigThresholds,
} from '../../selectors/Entities/temperatureBreachConfig';
import { SensorActions } from '../../actions/Entities/SensorActions';
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
    <Paper height={320} headerText={vaccineStrings.new_sensor_step_two_title}>
      <AfterInteractions placeholder={null}>
        <BreachConfigRow
          threshold={hotConsecutiveThreshold}
          type="HOT_CONSECUTIVE"
          {...hotConsecutiveConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
        />
        <BreachConfigRow
          threshold={coldConsecutiveThreshold}
          type="COLD_CONSECUTIVE"
          {...coldConsecutiveConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
        />
        <BreachConfigRow
          threshold={hotCumulativeThreshold}
          type="HOT_CUMULATIVE"
          {...hotCumulativeConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
        />
        <BreachConfigRow
          threshold={coldCumulativeThreshold}
          type="COLD_CUMULATIVE"
          {...coldCumulativeConfig}
          updateDuration={updateDuration}
          updateTemperature={updateTemperature}
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
  const exit = () => {
    dispatch(goBack());
    dispatch(SensorActions.reset());
    dispatch(TemperatureBreachConfigActions.resetGroup());
  };
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

const configShape = {
  temperature: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  threshold: PropTypes.number.isRequired,
};

NewSensorStepTwoComponent.propTypes = {
  nextTab: PropTypes.func.isRequired,
  previousTab: PropTypes.func.isRequired,
  exit: PropTypes.func.isRequired,
  hotConsecutiveConfig: PropTypes.shape(configShape).isRequired,
  coldCumulativeConfig: PropTypes.shape(configShape).isRequired,
  coldConsecutiveConfig: PropTypes.shape(configShape).isRequired,
  hotCumulativeConfig: PropTypes.shape(configShape).isRequired,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  coldConsecutiveThreshold: PropTypes.number.isRequired,
  hotConsecutiveThreshold: PropTypes.number.isRequired,
  hotCumulativeThreshold: PropTypes.number.isRequired,
  coldCumulativeThreshold: PropTypes.number.isRequired,
};

export const NewSensorStepTwo = connect(stateToProps, dispatchToProps)(NewSensorStepTwoComponent);
