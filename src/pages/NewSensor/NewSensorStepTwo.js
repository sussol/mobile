import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { TabContainer } from './TabContainer';
import { BreachConfigRow } from './BreachConfigRow';
import { Paper, FlexRow, PageButton, Spacer } from '../../widgets';

import { SUSSOL_ORANGE, WHITE } from '../../globalStyles';
import { buttonStrings, vaccineStrings } from '../../localization';
import { WizardActions } from '../../actions/WizardActions';
import { goBack } from '../../navigation/actions';
import { selectConfigs } from '../../selectors/newSensor';
import { NewSensorActions } from '../../actions';

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
}) => (
  <TabContainer>
    <Paper height={320} headerText={vaccineStrings.new_sensor_step_two_title}>
      <BreachConfigRow
        type="HOT_CONSECUTIVE"
        {...hotConsecutiveConfig}
        updateDuration={updateDuration}
        updateTemperature={updateTemperature}
      />
      <BreachConfigRow
        type="COLD_CONSECUTIVE"
        {...coldConsecutiveConfig}
        updateDuration={updateDuration}
        updateTemperature={updateTemperature}
      />
      <BreachConfigRow
        type="HOT_CUMULATIVE"
        {...hotCumulativeConfig}
        updateDuration={updateDuration}
        updateTemperature={updateTemperature}
      />
      <BreachConfigRow
        type="COLD_CUMULATIVE"
        {...coldCumulativeConfig}
        updateDuration={updateDuration}
        updateTemperature={updateTemperature}
      />
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
    hotConsecutiveConfig,
    coldCumulativeConfig,
    coldConsecutiveConfig,
    hotCumulativeConfig,
  } = selectConfigs(state);

  return { hotConsecutiveConfig, coldCumulativeConfig, coldConsecutiveConfig, hotCumulativeConfig };
};

const dispatchToProps = dispatch => {
  const nextTab = () => dispatch(WizardActions.nextTab());
  const previousTab = () => dispatch(WizardActions.previousTab());
  const exit = () => dispatch(goBack());
  const updateDuration = (type, value) =>
    dispatch(NewSensorActions.updateConfig(type, 'duration', value));
  const updateTemperature = (type, value) =>
    dispatch(NewSensorActions.updateConfig(type, 'temperature', value));

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
};

export const NewSensorStepTwo = connect(stateToProps, dispatchToProps)(NewSensorStepTwoComponent);
