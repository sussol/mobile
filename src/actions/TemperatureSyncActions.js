/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { UIDatabase } from '../database';
import { Sensor } from '../database/DataTypes';
import { createRecord } from '../database/utilities';
import { MILLISECONDS } from '../utilities';

export const TEMPERATURE_SYNC_ACTIONS = {
  SCAN_START: 'TemperatureSync/scanStart',
  SCAN_COMPLETE: 'TemperatureSync/scanComplete',
  SCAN_ERROR: 'TemperatureSync/scanError',

  DOWNLOAD_LOGS_START: 'TemperatureSync/downloadLogsStart',
  DOWNLOAD_LOGS_COMPLETE: 'TemperatureSync/downloadLogsComplete',
  DOWNLOAD_LOGS_ERROR: 'TemperatureSync/downloadLogsErorr',

  START_RESETTING_ADVERTISEMENT_FREQUENCY: 'TemperatureSync/startResettingAdvertisementFrequency',
  ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: 'TemperatureSync/errorResettingAdvertisementFrequency',
  COMPLETE_RESETTING_ADVERTISEMENT_FREQUENCY:
    'TemperatureSync/completeResettingAdvertisementFrequency',
  START_RESETTING_LOG_FREQUENCY: 'TemperatureSync/startResettingLogFrequency',
  COMPLETE_RESETTING_LOG_FREQUENCY: 'TemperatureSync/completeResettingLogFrequency',
  ERROR_RESETTING_LOG_FREQUENCY: 'TemperatureSync/errorResettingLogFrequency',
};

const scanStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_START });
const scanComplete = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_COMPLETE });
const scanError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR });

const updateSensors = sensorAdvertisements => dispatch => {
  const isArray = Object.isArray(sensorAdvertisements);

  if (!isArray) dispatch(scanError());
  if (isArray && !sensorAdvertisements.length) dispatch(scanError());

  if (isArray && sensorAdvertisements.length) {
    sensorAdvertisements.forEach(({ macAddress, batteryLevel }) => {
      UIDatabase.write(() => {
        UIDatabase.update('Sensor', {
          ...UIDatabase.get('Sensor', 'macAddress', macAddress),
          macAddress,
          batteryLevel,
        });
      });
    });
  }
};

const scanForSensors = () => async dispatch => {
  dispatch(scanStart());

  const sensorResult = await Sensor.startScan();
  const { success, data } = sensorResult;

  dispatch(updateSensors(data));

  if (success) dispatch(scanComplete());
};

const downloadLogsError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_ERROR });
const downloadLogsStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_START });
const downloadLogsComplete = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
});

const downloadLogs = sensor => async dispatch => {
  dispatch(downloadLogsStart());

  const downloadedLogsResult = (await sensor?.downloadLogs()) ?? {};
  const { success = false, data = [] } = downloadedLogsResult;

  if (success && data?.[0]?.logs) {
    const sensorLogs = data[0]?.logs;
    const timeNow = new Date().getTime();

    if (Object.isArray(sensorLogs)) {
      UIDatabase.write(() =>
        sensorLogs.forEach(({ temperature }, i) => {
          const timestamp = timeNow - (i + 1) * MILLISECONDS.FIVE_MINUTES;
          createRecord(UIDatabase, 'SensorLog', temperature, new Date(timestamp), sensor);
        })
      );
    }

    dispatch(downloadLogsComplete());
  } else {
    dispatch(downloadLogsError());
  }

  return Promise.resolve();
};

const startResettingAdvertisementFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.START_RESETTING_ADVERTISEMENT_FREQUENCY,
});
const completeResettingAdvertisementFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_ADVERTISEMENT_FREQUENCY,
});
const errorResettingAdvertisementFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_ADVERTISEMENT_FREQUENCY,
});

const resetAdvertisementFrequency = sensor => async dispatch => {
  dispatch(startResettingAdvertisementFrequency());

  const resettingAdvertisementFrequencyResult = await sensor.resetAdvertisementFrequency();

  const { success } = resettingAdvertisementFrequencyResult;

  if (success) dispatch(completeResettingAdvertisementFrequency());
  else dispatch(errorResettingAdvertisementFrequency());

  return Promise.resolve();
};

const startResettingLogFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.START_RESETTING_LOG_FREQUENCY,
});
const completeResettingLogFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_RESETTING_LOG_FREQUENCY,
});
const errorResettingLogFrequency = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.ERROR_RESETTING_LOG_FREQUENCY,
});

const resetLogFrequency = sensor => async dispatch => {
  dispatch(startResettingLogFrequency());

  const resettingLogFrequencyResult = await sensor.resetLogFrequency();

  const { success } = resettingLogFrequencyResult;

  if (success) dispatch(completeResettingLogFrequency());
  else dispatch(errorResettingLogFrequency());

  return Promise.resolve();
};

export const TemperatureSyncActions = {
  scanForSensors,
};
