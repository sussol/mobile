/* eslint-disable react/forbid-prop-types */

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { ActivityIndicator, FlatList, View } from 'react-native';
import PropTypes from 'prop-types';
import { useIsFocused } from '@react-navigation/native';

import { TabContainer } from './TabContainer';
import { ScanRow } from './ScanRow';
import { FlexRow, PaperSection } from '../../widgets';
import { TextWithIcon } from '../../widgets/Typography';

import { vaccineStrings } from '../../localization';
import { SUSSOL_ORANGE } from '../../globalStyles';
import { ScanActions } from '../../actions/Bluetooth/ScanActions';
import { selectScannedSensors } from '../../selectors/Bluetooth/bluetooth';

const Spinner = () => (
  <FlexRow justifyContent="center">
    <View>
      <TextWithIcon left Icon={<ActivityIndicator size="small" color={SUSSOL_ORANGE} />}>
        {vaccineStrings.scanning}
      </TextWithIcon>
    </View>
  </FlexRow>
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
      <PaperSection height={420} headerText={vaccineStrings.new_sensor_step_one_title}>
        <FlatList
          ListFooterComponent={<Spinner />}
          keyExtractor={item => item}
          style={{ height: 360 }}
          data={macAddresses}
          renderItem={({ item }) => <ScanRow macAddress={item} />}
        />
      </PaperSection>
    </TabContainer>
  );
};

NewSensorStepOneComponent.propTypes = {
  macAddresses: PropTypes.array.isRequired,
  startScan: PropTypes.func.isRequired,
  stopScan: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => {
  const startScan = () => dispatch(ScanActions.startSensorScan());
  const stopScan = () => dispatch(ScanActions.stopSensorScan());

  return { startScan, stopScan };
};

const stateToProps = state => {
  const macAddresses = selectScannedSensors(state);
  return { macAddresses };
};

export const NewSensorStepOne = connect(stateToProps, dispatchToProps)(NewSensorStepOneComponent);
