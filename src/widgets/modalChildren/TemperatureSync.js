/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PageButton, ProgressBar, FlexColumn } from '..';

import { syncStrings } from '../../localization';
import globalStyles, { WARM_GREY } from '../../globalStyles';

import { VaccineActions } from '../../actions/VaccineActions';
import {
  selectTemperatureSyncLastSyncString,
  selectCurrentSensorNameString,
  selectTemperatureSyncIsComplete,
  selectTemperatureSyncProgress,
  selectErrorMessage,
} from '../../selectors/temperatureSync';
import { selectIsSyncingTemps, selectTemperatureSyncMessage } from '../../selectors/vaccine';

const TemperatureSyncComponent = ({
  total,
  progress,
  lastTemperatureSync,
  temperatureSyncMessage,
  isSyncing,
  currentSensor,
  syncTemperatures,
  isComplete,
  errorMessage,
}) => (
  <FlexColumn justifyContent="center" alignItems="center" flex={1}>
    <View style={localStyles.row}>
      <ProgressBar total={total} progress={progress} isComplete={isComplete} />
    </View>

    {currentSensor && <Text style={localStyles.progressDescription}>{currentSensor}</Text>}
    <Text style={localStyles.progressDescription}> {temperatureSyncMessage} </Text>
    <Text style={localStyles.lastSyncText}>{errorMessage}</Text>
    <Text style={localStyles.lastSyncText}>{syncStrings.last_successful_sync}</Text>
    <Text style={localStyles.lastSyncText}>{lastTemperatureSync}</Text>

    <PageButton
      style={globalStyles.manualSyncButton}
      textStyle={globalStyles.whiteButtonText}
      isDisabled={isSyncing}
      disabledColor={WARM_GREY}
      text={syncStrings.manual_sync}
      onPress={syncTemperatures}
    />
  </FlexColumn>
);

const mapStateToProps = state => {
  const temperatureSyncMessage = selectTemperatureSyncMessage(state);
  const lastTemperatureSync = selectTemperatureSyncLastSyncString(state);
  const currentSensor = selectCurrentSensorNameString(state);
  const isComplete = selectTemperatureSyncIsComplete(state);
  const { progress, total } = selectTemperatureSyncProgress(state);
  const isSyncing = selectIsSyncingTemps(state);
  const errorMessage = selectErrorMessage(state);

  return {
    isSyncing,
    temperatureSyncMessage,
    lastTemperatureSync,
    currentSensor,
    isComplete,
    progress,
    total,
    errorMessage,
  };
};

const mapDispatchToProps = dispatch => ({
  syncTemperatures: () => dispatch(VaccineActions.startDownloadAll()),
});

TemperatureSyncComponent.defaultProps = {
  currentSensor: null,
  errorMessage: '',
};

TemperatureSyncComponent.propTypes = {
  total: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  lastTemperatureSync: PropTypes.string.isRequired,
  temperatureSyncMessage: PropTypes.string.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  currentSensor: PropTypes.string,
  syncTemperatures: PropTypes.func.isRequired,
  isComplete: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
};

export const TemperatureSync = connect(
  mapStateToProps,
  mapDispatchToProps
)(TemperatureSyncComponent);

const localStyles = StyleSheet.create({
  progressDescription: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    width: Dimensions.get('window').width / 3,
    paddingHorizontal: 50,
    paddingVertical: 20,
  },
  lastSyncText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});
