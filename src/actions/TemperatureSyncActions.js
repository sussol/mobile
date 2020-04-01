/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { generateUUID } from 'react-native-database';

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
};

const scanStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_START });
const scanComplete = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_COMPLETE });
const scanError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR });

const updateSensors = sensorAdvertisements => dispatch => {
  const isArray = Array.isArray(sensorAdvertisements);

  if (!isArray) dispatch(scanError());
  if (isArray && !sensorAdvertisements.length) dispatch(scanError());

  if (isArray && sensorAdvertisements.length) {
    sensorAdvertisements.forEach(({ macAddress, batteryLevel }) => {
      UIDatabase.write(() => {
        UIDatabase.update('Sensor', {
          id: generateUUID(),
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

export const TemperatureSyncActions = {
  scanForSensors,
};
