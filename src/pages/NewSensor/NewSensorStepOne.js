/* eslint-disable react/forbid-prop-types */

import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';
import { TabContainer } from './TabContainer';
import { Paper } from '../../widgets';
import { vaccineStrings } from '../../localization';
import { SensorScanActions } from '../../actions/Bluetooth/SensorScanActions';
import { selectScannedSensors } from '../../selectors/Bluetooth/sensorScan';
import { SensorPicker } from '../../widgets/SensorPicker';
import { SensorActions } from '../../actions/Entities/index';
import { WizardActions } from '../../actions/index';

export const NewSensorStepOneComponent = ({ selectSensor }) => {
  const navigation = useNavigation();

  const onSelectSensor = useCallback(
    macAddress => {
      selectSensor(macAddress);
      navigation.navigate('1');
    },
    [selectSensor]
  );

  return (
    <TabContainer>
      <Paper height={420} headerText={vaccineStrings.new_sensor_step_one_title}>
        <SensorPicker selectSensor={onSelectSensor} />
      </Paper>
    </TabContainer>
  );
};

NewSensorStepOneComponent.propTypes = {
  selectSensor: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => {
  const startScan = () => dispatch(SensorScanActions.startSensorScan());
  const stopScan = () => dispatch(SensorScanActions.stopSensorScan());
  const selectSensor = macAddress => {
    dispatch(SensorActions.createFromScanner(macAddress));
    dispatch(WizardActions.nextTab());
  };

  return { startScan, stopScan, selectSensor };
};

const stateToProps = state => {
  const macAddresses = selectScannedSensors(state);
  return { macAddresses };
};

export const NewSensorStepOne = connect(stateToProps, dispatchToProps)(NewSensorStepOneComponent);
