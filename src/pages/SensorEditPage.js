/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  DataTablePageView,
  EditorRow,
  FlexRow,
  HazardIcon,
  InfoIcon,
  PageButton,
  Paper,
  TextEditor,
  BatteryIcon,
  IconButton,
  LightbulbIcon,
  WifiIcon,
} from '../widgets';
import { BreachConfigRow } from './NewSensor/BreachConfigRow';
import { DurationEditor } from '../widgets/StepperInputs';
import { TextWithIcon } from '../widgets/Typography';

import { useLoadingIndicator } from '../hooks/useLoadingIndicator';
import { selectConfigs, selectSensorDetail } from '../selectors/sensorDetail';
import { SensorDetailActions } from '../actions/SensorDetailActions';

import { generalStrings, vaccineStrings } from '../localization';
import {
  MISTY_CHARCOAL,
  APP_FONT_FAMILY,
  DARKER_GREY,
  LIGHT_GREY,
  SUSSOL_ORANGE,
  WHITE,
} from '../globalStyles';

import { SECONDS } from '../utilities/constants';
import { VaccineActions } from '../actions/VaccineActions';

const formatLastSyncDate = date => moment(date).fromNow();
const formatBatteryLevel = batteryLevel => `${batteryLevel}%`;

export const FridgeHeader = ({ macAddress, batteryLevel, lastSyncDate, onBlink }) => (
  <>
    <View>
      <Text style={localStyles.paperTitleText}>{macAddress}</Text>
    </View>
    <TextWithIcon
      containerStyle={localStyles.headerTextWithIcon}
      size="s"
      Icon={<BatteryIcon color={MISTY_CHARCOAL} />}
    >
      {formatBatteryLevel(batteryLevel)}
    </TextWithIcon>
    <TextWithIcon
      containerStyle={localStyles.headerTextWithIcon}
      size="s"
      Icon={<WifiIcon size={20} color={MISTY_CHARCOAL} />}
    >
      {formatLastSyncDate(lastSyncDate)}
    </TextWithIcon>
    <IconButton
      containerStyle={{ width: 50, justifyContent: 'center' }}
      Icon={<LightbulbIcon color={DARKER_GREY} />}
      onPress={() => onBlink(macAddress)}
    />
  </>
);

FridgeHeader.defaultProps = {
  macAddress: 'AA:BB:CC:DD:EE:FF',
  batteryLevel: 99,
  lastSyncDate: new Date(),
};

FridgeHeader.propTypes = {
  macAddress: PropTypes.string,
  batteryLevel: PropTypes.number,
  lastSyncDate: PropTypes.instanceOf(Date),
  onBlink: PropTypes.func.isRequired,
};

export const SensorEditPageComponent = ({
  logInterval,
  name,
  code,
  updateName,
  updateCode,
  hotConsecutiveConfig,
  coldConsecutiveConfig,
  hotCumulativeConfig,
  coldCumulativeConfig,
  updateDuration,
  updateTemperature,
  updateLogInterval,
  saveSensor,
  macAddress,
  batteryLevel,
  lastSyncDate,
  blink,
}) => {
  const withLoadingIndicator = useLoadingIndicator();

  return (
    <DataTablePageView style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
      <Paper
        Header={
          <FridgeHeader
            onBlink={blink}
            lastSyncDate={lastSyncDate}
            macAddress={macAddress}
            batteryLevel={batteryLevel}
          />
        }
      >
        <EditorRow label={vaccineStrings.sensor_name} Icon={<InfoIcon color={DARKER_GREY} />}>
          <TextEditor size="large" value={name} onChangeText={updateName} />

          <TextEditor label={vaccineStrings.sensor_code} value={code} onChangeText={updateCode} />
        </EditorRow>
      </Paper>

      <Paper>
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

      <Paper>
        <FlexRow alignItems="center" justifyContent="flex-end">
          <DurationEditor
            value={logInterval / SECONDS.ONE_MINUTE}
            onChange={updateLogInterval}
            label={vaccineStrings.logging_interval}
          />
        </FlexRow>
      </Paper>

      <FlexRow flex={1} alignItems="center">
        <TextWithIcon left Icon={<HazardIcon color={LIGHT_GREY} />} size="ms">
          {vaccineStrings.bluetooth_changes_can_take_time}
        </TextWithIcon>

        <PageButton
          onPress={() => withLoadingIndicator(saveSensor)}
          text={generalStrings.save}
          textStyle={localStyles.pageButtonText}
          style={{ backgroundColor: SUSSOL_ORANGE }}
        />
      </FlexRow>
    </DataTablePageView>
  );
};

const localStyles = StyleSheet.create({
  paperTitleText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
    backgroundColor: 'red',
  },
  headerTextWithIcon: {
    flex: 0,
    paddingHorizontal: 8,
  },
  pageButtonText: {
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
    color: WHITE,
  },
});

const stateToProps = state => {
  const sensorDetail = selectSensorDetail(state);
  const { code, name, logInterval, macAddress, batteryLevel, lastSyncDate } = sensorDetail;
  const {
    hotConsecutiveConfig,
    coldCumulativeConfig,
    coldConsecutiveConfig,
    hotCumulativeConfig,
  } = selectConfigs(state);

  return {
    lastSyncDate,
    code,
    name,
    logInterval,
    macAddress,
    hotConsecutiveConfig,
    coldCumulativeConfig,
    coldConsecutiveConfig,
    hotCumulativeConfig,
    batteryLevel,
  };
};

const dispatchToProps = dispatch => {
  const blink = macAddress => dispatch(VaccineActions.startSensorBlink(macAddress));
  const updateName = name => dispatch(SensorDetailActions.updateName(name));
  const updateCode = code => dispatch(SensorDetailActions.updateCode(code));
  const updateLogInterval = logInterval =>
    dispatch(SensorDetailActions.updateLogInterval(logInterval));
  const updateDuration = (type, value) =>
    dispatch(SensorDetailActions.updateConfig(type, 'duration', value));
  const updateTemperature = (type, value) =>
    dispatch(SensorDetailActions.updateConfig(type, 'temperature', value));
  const saveSensor = async () => {
    await new Promise(r => setTimeout(r, 3000));
  };

  return {
    blink,
    updateName,
    updateCode,
    updateLogInterval,
    updateDuration,
    updateTemperature,
    saveSensor,
  };
};

const configShape = {
  duration: PropTypes.number.isRequired,
  temperature: PropTypes.number.isRequired,
  threshold: PropTypes.number.isRequired,
};

SensorEditPageComponent.defaultProps = {
  hotConsecutiveConfig: {},
  coldConsecutiveConfig: {},
  hotCumulativeConfig: {},
  coldCumulativeConfig: {},
};

SensorEditPageComponent.propTypes = {
  lastSyncDate: PropTypes.instanceOf(Date).isRequired,
  batteryLevel: PropTypes.number.isRequired,
  macAddress: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  logInterval: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  hotConsecutiveConfig: PropTypes.shape(configShape),
  coldConsecutiveConfig: PropTypes.shape(configShape),
  hotCumulativeConfig: PropTypes.shape(configShape),
  coldCumulativeConfig: PropTypes.shape(configShape),
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  updateLogInterval: PropTypes.func.isRequired,
  saveSensor: PropTypes.func.isRequired,
  updateName: PropTypes.func.isRequired,
  updateCode: PropTypes.func.isRequired,
  blink: PropTypes.func.isRequired,
};

export const SensorEditPage = connect(stateToProps, dispatchToProps)(SensorEditPageComponent);
