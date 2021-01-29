/* eslint-disable react/forbid-prop-types */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, FlatList } from 'react-native';
import PropTypes from 'prop-types';
import { useIsFocused } from '@react-navigation/native';

import { TabContainer } from './TabContainer';
import { ScanRow } from './ScanRow';
import { Paper } from '../../widgets';
import { TextWithIcon } from '../../widgets/Typography';

import { vaccineStrings } from '../../localization';
import { VaccineActions } from '../../actions/VaccineActions';
import { selectScannedSensors } from '../../selectors/vaccine';
import { SUSSOL_ORANGE } from '../../globalStyles';

const Spinner = () => (
  <TextWithIcon
    left
    Icon={<ActivityIndicator color={SUSSOL_ORANGE} />}
    containerStyle={{ justifyContent: 'center' }}
  >
    {vaccineStrings.scanning}
  </TextWithIcon>
);

export const NewSensorStepOneComponent = ({ startScan, stopScan, macAddresses }) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) startScan();
    else stopScan();
    return stopScan;
  }, [startScan, isFocused]);

  return (
    <TabContainer>
      <Paper height={420} headerText={vaccineStrings.new_sensor_step_one_title}>
        <FlatList
          data={macAddresses}
          renderItem={({ item }) => <ScanRow macAddress={item} />}
          keyExtractor={item => item}
          style={{ height: 360 }}
          ListFooterComponent={<Spinner />}
        />
      </Paper>
    </TabContainer>
  );
};

NewSensorStepOneComponent.propTypes = {
  macAddresses: PropTypes.array.isRequired,
  startScan: PropTypes.func.isRequired,
  stopScan: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => {
  const startScan = () => dispatch(VaccineActions.startSensorScan());
  const stopScan = () => dispatch(VaccineActions.stopSensorScan());

  return { startScan, stopScan };
};

const stateToProps = state => {
  const macAddresses = selectScannedSensors(state);
  return { macAddresses };
};

export const NewSensorStepOne = connect(stateToProps, dispatchToProps)(NewSensorStepOneComponent);
