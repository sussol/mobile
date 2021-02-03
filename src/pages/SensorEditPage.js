/* eslint-disable react/jsx-curly-newline */
/* eslint-disable react/forbid-prop-types */
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

import { generalStrings, vaccineStrings } from '../localization';
import {
  MISTY_CHARCOAL,
  APP_FONT_FAMILY,
  DARKER_GREY,
  LIGHT_GREY,
  SUSSOL_ORANGE,
  WHITE,
} from '../globalStyles';
import { SensorActions } from '../actions';
import { SensorBlinkActions } from '../actions/Bluetooth/SensorBlinkActions';
import { SensorUpdateActions } from '../actions/Bluetooth/SensorUpdateActions';
import { AfterInteractions } from '../widgets/AfterInteractions';
import { selectEditingSensor } from '../selectors/Entities/sensor';
import {
  selectEditingConfigsByType,
  selectEditingConfigThresholds,
} from '../selectors/Entities/temperatureBreachConfig';
import { LocationActions, TemperatureBreachConfigActions } from '../actions/Entities/index';
import { selectEditingLocation } from '../selectors/Entities/location';
import { goBack } from '../navigation/actions';
import { MILLISECONDS } from '../utilities/index';

const formatLastSyncDate = date => (date ? moment(date).fromNow() : generalStrings.not_available);
const formatBatteryLevel = batteryLevel => `${batteryLevel}%`;

export const FridgeHeader = ({ macAddress, batteryLevel, lastSyncDate, onBlink }) => (
  <>
    <View style={{ flex: 1, justifyContent: 'center' }}>
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
  lastSyncDate: null,
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
  hotConsecutiveThreshold,
  coldCumulativeThreshold,
  coldConsecutiveThreshold,
  hotCumulativeThreshold,
}) => {
  const withLoadingIndicator = useLoadingIndicator();
  return (
    <DataTablePageView style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
      <AfterInteractions>
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
          <EditorRow
            label={vaccineStrings.sensor_name}
            Icon={<InfoIcon color={DARKER_GREY} />}
            containerStyle={localStyles.paperContentRow}
          >
            <TextEditor size="large" value={name} onChangeText={updateName} />
            <TextEditor label={vaccineStrings.sensor_code} value={code} onChangeText={updateCode} />
          </EditorRow>
        </Paper>

        <Paper>
          <BreachConfigRow
            threshold={hotConsecutiveThreshold}
            containerStyle={localStyles.paperContentRow}
            type="HOT_CONSECUTIVE"
            {...hotConsecutiveConfig}
            updateDuration={(_, value) => updateDuration(hotConsecutiveConfig.id, value)}
            updateTemperature={(type, value) =>
              updateTemperature(type, hotConsecutiveConfig.id, value)
            }
          />
          <BreachConfigRow
            threshold={coldConsecutiveThreshold}
            containerStyle={localStyles.paperContentRow}
            type="COLD_CONSECUTIVE"
            {...coldConsecutiveConfig}
            updateDuration={(_, value) => updateDuration(coldConsecutiveConfig.id, value)}
            updateTemperature={(type, value) =>
              updateTemperature(type, coldConsecutiveConfig.id, value)
            }
          />
          <BreachConfigRow
            threshold={hotCumulativeThreshold}
            containerStyle={localStyles.paperContentRow}
            type="HOT_CUMULATIVE"
            {...hotCumulativeConfig}
            updateDuration={(_, value) => updateDuration(hotCumulativeConfig.id, value)}
            updateTemperature={(type, value) =>
              updateTemperature(type, hotCumulativeConfig.id, value)
            }
          />
          <BreachConfigRow
            threshold={coldCumulativeThreshold}
            containerStyle={localStyles.paperContentRow}
            type="COLD_CUMULATIVE"
            {...coldCumulativeConfig}
            updateDuration={(_, value) => updateDuration(coldCumulativeConfig.id, value)}
            updateTemperature={(type, value) =>
              updateTemperature(type, coldCumulativeConfig.id, value)
            }
          />
        </Paper>

        <Paper>
          <FlexRow justifyContent="flex-end">
            <DurationEditor
              containerStyle={localStyles.paperContentRow}
              value={logInterval}
              onChange={updateLogInterval}
              label={vaccineStrings.logging_interval}
            />
          </FlexRow>
        </Paper>

        <FlexRow flex={1} alignItems="flex-end">
          <TextWithIcon left Icon={<HazardIcon color={LIGHT_GREY} />} size="ms">
            {vaccineStrings.bluetooth_changes_can_take_time}
          </TextWithIcon>

          <PageButton
            onPress={() => withLoadingIndicator(() => saveSensor({ macAddress, logInterval }))}
            text={generalStrings.save}
            textStyle={localStyles.pageButtonText}
            style={{ backgroundColor: SUSSOL_ORANGE }}
          />
        </FlexRow>
      </AfterInteractions>
    </DataTablePageView>
  );
};

const localStyles = StyleSheet.create({
  paperContentRow: {
    padding: 8,
  },
  paperTitleText: {
    color: DARKER_GREY,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    textTransform: 'uppercase',
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
  const sensorDetail = selectEditingSensor(state);
  const location = selectEditingLocation(state);

  const { code } = location ?? {};
  const { name, logInterval, macAddress, batteryLevel, lastSyncDate = null } = sensorDetail ?? {};
  const {
    HOT_CONSECUTIVE: hotConsecutiveConfig = {},
    COLD_CONSECUTIVE: coldConsecutiveConfig = {},
    HOT_CUMULATIVE: hotCumulativeConfig = {},
    COLD_CUMULATIVE: coldCumulativeConfig = {},
  } = selectEditingConfigsByType(state);

  const {
    hotConsecutiveThreshold,
    coldCumulativeThreshold,
    coldConsecutiveThreshold,
    hotCumulativeThreshold,
  } = selectEditingConfigThresholds(state);

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
    hotConsecutiveThreshold,
    coldCumulativeThreshold,
    coldConsecutiveThreshold,
    hotCumulativeThreshold,
    batteryLevel,
  };
};

const dispatchToProps = (dispatch, ownProps) => {
  const { route } = ownProps;
  const { params } = route;
  const { sensor } = params;
  const { id: sensorID } = sensor;
  const { location } = sensor;
  const { id: locationID } = location;

  const blink = macAddress => dispatch(SensorBlinkActions.startSensorBlink(macAddress));
  const updateName = name => dispatch(SensorActions.update(sensorID, 'name', name));
  const updateCode = code => dispatch(LocationActions.update(locationID, 'code', code));
  const updateLogInterval = logInterval =>
    dispatch(SensorActions.update(sensorID, 'logInterval', logInterval));
  const updateDuration = (id, value) =>
    dispatch(
      TemperatureBreachConfigActions.update(id, 'duration', value * MILLISECONDS.ONE_MINUTE)
    );
  const updateTemperature = (type, id, value) => {
    const isHot = type.includes('HOT');
    const field = isHot ? 'minimumTemperature' : 'maximumTemperature';
    dispatch(TemperatureBreachConfigActions.update(id, field, value));
  };
  const saveSensor = sensorToUpdate =>
    dispatch(SensorUpdateActions.updateSensor(sensorToUpdate))
      .then(() => dispatch(SensorActions.save()))
      .then(() => dispatch(goBack()))
      .catch(e => console.log(e));

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

SensorEditPageComponent.defaultProps = {
  hotConsecutiveConfig: {},
  coldConsecutiveConfig: {},
  hotCumulativeConfig: {},
  coldCumulativeConfig: {},
  name: '',
  code: '',
  logInterval: 300,
  macAddress: '',
  batteryLevel: 0,
  lastSyncDate: null,
};

SensorEditPageComponent.propTypes = {
  lastSyncDate: PropTypes.instanceOf(Date),
  batteryLevel: PropTypes.number,
  macAddress: PropTypes.string,
  name: PropTypes.string,
  logInterval: PropTypes.number,
  code: PropTypes.string,
  hotConsecutiveConfig: PropTypes.object,
  coldConsecutiveConfig: PropTypes.object,
  hotCumulativeConfig: PropTypes.object,
  coldCumulativeConfig: PropTypes.object,
  updateDuration: PropTypes.func.isRequired,
  updateTemperature: PropTypes.func.isRequired,
  updateLogInterval: PropTypes.func.isRequired,
  saveSensor: PropTypes.func.isRequired,
  updateName: PropTypes.func.isRequired,
  updateCode: PropTypes.func.isRequired,
  blink: PropTypes.func.isRequired,
  hotConsecutiveThreshold: PropTypes.number.isRequired,
  coldCumulativeThreshold: PropTypes.number.isRequired,
  coldConsecutiveThreshold: PropTypes.number.isRequired,
  hotCumulativeThreshold: PropTypes.number.isRequired,
};

export const SensorEditPage = connect(stateToProps, dispatchToProps)(SensorEditPageComponent);
