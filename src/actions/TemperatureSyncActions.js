/* eslint-disable no-await-in-loop */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { generateUUID } from 'react-native-database';

import { UIDatabase } from '../database';
import { Sensor } from '../database/DataTypes';
import { createRecord } from '../database/utilities';
import { MILLISECONDS } from '../utilities';
import { chunk } from '../utilities/chunk';

export const TEMPERATURE_SYNC_ACTIONS = {
  OPEN_MODAL: 'TemperatureSync/openModal',
  CLOSE_MODAL: 'TemperatureSync/closeModal',
  ERROR_NO_SENSORS: 'TemperatureSync/errorNoSensors',

  START_SYNC: 'TemperatureSync/startSync',
  COMPLETE_SYNC: 'TemperatureSync/completeSync',

  SCAN_START: 'TemperatureSync/scanStart',
  SCAN_COMPLETE: 'TemperatureSync/scanComplete',
  SCAN_ERROR: 'TemperatureSync/scanError',

  DOWNLOAD_LOGS_START: 'TemperatureSync/downloadLogsStart',
  DOWNLOAD_LOGS_COMPLETE: 'TemperatureSync/downloadLogsComplete',
  DOWNLOAD_LOGS_ERROR: 'TemperatureSync/downloadLogsError',

  START_RESETTING_ADVERTISEMENT_FREQUENCY: 'TemperatureSync/startResettingAdvertisementFrequency',
  ERROR_RESETTING_ADVERTISEMENT_FREQUENCY: 'TemperatureSync/errorResettingAdvertisementFrequency',
  COMPLETE_RESETTING_ADVERTISEMENT_FREQUENCY:
    'TemperatureSync/completeResettingAdvertisementFrequency',
  START_RESETTING_LOG_FREQUENCY: 'TemperatureSync/startResettingLogFrequency',
  COMPLETE_RESETTING_LOG_FREQUENCY: 'TemperatureSync/completeResettingLogFrequency',
  ERROR_RESETTING_LOG_FREQUENCY: 'TemperatureSync/errorResettingLogFrequency',

  START_SAVING_TEMPERATURE_LOGS: 'TemperatureSync/startSavingTemperatureLogs',
  COMPLETE_SAVING_TEMPERATURE_LOGS: 'TemperatureSync/completeSavingTemperatureLogs',

  UPDATE_SENSOR_PROGRESS: 'TemperatureSync/updateSensorProgress',
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
          ...UIDatabase.get('Sensor', macAddress, 'macAddress'),
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

    if (Array.isArray(sensorLogs)) {
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

  return new Promise(resolver => resolver(success));
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

  return new Promise(resolver => resolver(success));
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

  return new Promise(resolver => resolver(success));
};

const startSavingTemperatureLogs = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.START_SAVING_TEMPERATURE_LOGS,
});
const completeSavingTemperatureLogs = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_SAVING_TEMPERATURE_LOGS,
});

const createTemperatureLogs = sensor => dispatch => {
  const { sensorLogs, location } = sensor;

  // Only create TemperatureLogs for the greatest multiple of 6 SensorLogs,
  // as each SensorLog is a 5 minute log, and each Temperature log a 30 minute log.
  const iterateToo = sensorLogs.length - (sensorLogs.length % 6);
  const sensorLogsToGroup = sensorLogs.sorted('timestamp').slice(0, iterateToo);
  const groupedSensorLogs = chunk(sensorLogsToGroup, 6);

  dispatch(startSavingTemperatureLogs(groupedSensorLogs.length));

  UIDatabase.write(() => {
    groupedSensorLogs.forEach(sensorLogGroup => {
      const { isInBreach, mostRecentTemperatureBreach } = sensor;
      const newLogTemperature = Math.min(...sensorLogGroup.map(({ temperature }) => temperature));
      const newLogTimestamp = Math.min(...sensorLogGroup.map(({ timestamp }) => timestamp));

      const newLog = createRecord(
        UIDatabase,
        'TemperatureLog',
        newLogTemperature,
        new Date(newLogTimestamp),
        location
      );

      if (isInBreach) {
        if (mostRecentTemperatureBreach?.willContinueBreach(newLog)) {
          UIDatabase.update('TemperatureLog', { ...newLog, breach: mostRecentTemperatureBreach });
        } else {
          UIDatabase.update('TemperatureBreach', {
            ...mostRecentTemperatureBreach,
            endTimestamp: newLogTimestamp,
          });
        }
      } else {
        const breachConfigs = UIDatabase.objects('TemperatureBreachConfiguration');
        breachConfigs.some(breachConfig => breachConfig.createBreach(UIDatabase, location, newLog));
      }
    });

    UIDatabase.delete('SensorLog', sensorLogsToGroup);
  });

  dispatch(completeSavingTemperatureLogs());

  return Promise.resolve();
};

const errorNoSensors = () => ({ type: TEMPERATURE_SYNC_ACTIONS.ERROR_NO_SENSORS });
const startSync = () => ({ type: TEMPERATURE_SYNC_ACTIONS.START_SYNC });
const completeSync = () => ({ type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_SYNC });
const updateSensorProgress = sensor => ({
  type: TEMPERATURE_SYNC_ACTIONS.UPDATE_SENSOR_PROGRESS,
  payload: { sensor },
});

const syncTemperatures = () => async (dispatch, getState) => {
  const { temperatureSync } = getState();
  const { isSyncing } = temperatureSync;

  const sensors = UIDatabase.objects('Sensor').filtered('location != null');
  const { length: numberOfSensors } = sensors;

  if (isSyncing) return null;
  if (!numberOfSensors) return dispatch(errorNoSensors());

  dispatch(startSync());

  for (let i = 0; i < numberOfSensors; i++) {
    const sensor = sensors[i];

    dispatch(updateSensorProgress(sensor));

    const downloadedLogsResult = await dispatch(downloadLogs(sensor));
    if (downloadedLogsResult) {
      const resetLogFrequencyResult = await dispatch(resetLogFrequency(sensor));
      if (resetLogFrequencyResult) {
        const resetAdvertisementFrequencyResult = await dispatch(
          resetAdvertisementFrequency(sensor)
        );
        if (resetAdvertisementFrequencyResult) {
          dispatch(createTemperatureLogs(sensor));
        }
      }
    }
  }

  return dispatch(completeSync());
};

export const TemperatureSyncActions = {
  scanForSensors,
  syncTemperatures,
};
