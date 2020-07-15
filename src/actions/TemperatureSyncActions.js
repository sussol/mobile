/* eslint-disable no-await-in-loop */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { ToastAndroid } from 'react-native';
import { generateUUID } from 'react-native-database';
import moment from 'moment';

import { UIDatabase } from '../database';
import { Sensor } from '../database/DataTypes';
import { createRecord } from '../database/utilities';

import { chunk } from '../utilities/chunk';
import { MILLISECONDS } from '../utilities';

import { syncStrings, vaccineStrings } from '../localization';
import { PageActions } from '../pages/dataTableUtilities/actions';
import { ROUTES } from '../navigation';
import { PermissionSelectors } from '../selectors/permission';
import { PermissionActions } from './PermissionActions';

export const TEMPERATURE_SYNC_ACTIONS = {
  OPEN_MODAL: 'TemperatureSync/openModal',
  CLOSE_MODAL: 'TemperatureSync/closeModal',
  ERROR_NO_SENSORS: 'TemperatureSync/errorNoSensors',
  ERROR_BLUETOOTH_DISABLED: 'TemperatureSync/errorBluetoothDisabled',
  ERROR_LOCATION_DISABLED: 'TemperatureSync/errorLocationDisabled',

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

const openModal = () => ({ type: TEMPERATURE_SYNC_ACTIONS.OPEN_MODAL });
const closeModal = () => ({ type: TEMPERATURE_SYNC_ACTIONS.CLOSE_MODAL });

const scanStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_START });
const scanComplete = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_COMPLETE });
const scanError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.SCAN_ERROR });

const updateSensors = sensorAdvertisements => dispatch => {
  const isArray = Array.isArray(sensorAdvertisements);

  if (!isArray) dispatch(scanError());
  if (isArray && !sensorAdvertisements.length) dispatch(scanError());

  if (isArray && sensorAdvertisements.length) {
    sensorAdvertisements.forEach(({ macAddress, batteryLevel, logInterval }) => {
      UIDatabase.write(() => {
        UIDatabase.update('Sensor', {
          id: generateUUID(),
          ...UIDatabase.get('Sensor', macAddress, 'macAddress'),
          macAddress,
          batteryLevel,
          logInterval,
        });
      });
    });
  }
};

const startSensorScan = () => async (dispatch, getState) => {
  // Ensure the correct permissions before initiating a new sync process.
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

  if (!bluetoothEnabled) dispatch(errorDisabledBluetooth());
  if (!locationPermission) dispatch(errorDisabledLocation());
  if (!(bluetoothEnabled && locationPermission)) return null;

  await dispatch(scanForSensors());

  return dispatch(PageActions.refreshData(ROUTES.VACCINE_ADMIN_PAGE));
};

const scanForSensors = () => async dispatch => {
  dispatch(scanStart());

  const sensorResult = await Sensor.startScan();
  const { success, data } = sensorResult;

  dispatch(updateSensors(data));

  if (success) {
    ToastAndroid.show(
      vaccineStrings.formatString(vaccineStrings.found_sensors, data.length),
      ToastAndroid.LONG
    );
    dispatch(scanComplete());
  } else {
    ToastAndroid.show(vaccineStrings.could_not_find_sensors, ToastAndroid.LONG);
  }
};

const downloadLogsError = () => ({ type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_ERROR });
const downloadLogsStart = () => ({ type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_START });
const downloadLogsComplete = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
});

const saveLogs = (logData, sensor) => async dispatch => {
  const { length: numberOfLogs = 0 } = logData;

  dispatch(startSavingTemperatureLogs(logData?.length));
  const timeNow = moment(new Date());
  const { location, logInterval } = sensor;
  const { id: locationID } = location;

  // SensorLog are saved directly from a sensor as five-minute logs. A TemperatureLog is 30 minutes
  // worth of SensorLog records. If there isn't enough SensorLogs to aggregate into a
  // TemperatureLog, there may be some 'left over'. Start counting from whichever is sooner,
  // the most recent SensorLog or the most recent TemperatureLog.
  const sensorLogs = UIDatabase.objects('SensorLog').filtered('location.id == $0', locationID);
  const tempLogs = UIDatabase.objects('TemperatureLog').filtered('location.id == $0', locationID);
  const mostRecentSensorLogTime = moment(sensorLogs.max('timestamp') ?? timeNow);
  const mostRecentTempLogTime = moment(tempLogs.max('timestamp') ?? timeNow);
  const tempLogIsEarlier = mostRecentTempLogTime.isBefore(mostRecentSensorLogTime);
  const mostRecentLogTime = tempLogIsEarlier ? mostRecentSensorLogTime : mostRecentTempLogTime;

  // Calculate the number of LogIntervals it has been since the last sync/last log was
  // created and now. Then save that number of data points that were synced from
  // the bluetooth sensor. This ensures we are using the correct logs from the sensor
  // in the case where the logs weren't correctly deleted during a sync process.
  const numberOfSecondsSinceLastSync = timeNow.diff(mostRecentLogTime, 'seconds', true);
  const numberOfLogsToLookback =
    Math.ceil(numberOfSecondsSinceLastSync / logInterval) || numberOfLogs;
  const sliceIndex = numberOfLogs - numberOfLogsToLookback;
  const logsToSave = sliceIndex >= 0 ? logData.slice(sliceIndex) : [];

  UIDatabase.write(() =>
    logsToSave.forEach(({ temperature }, i) => {
      const timestampOffset = (i + 1) * logInterval;
      const timestamp = moment(mostRecentLogTime);
      timestamp.add(timestampOffset, 'seconds');
      createRecord(UIDatabase, 'SensorLog', temperature, timestamp.toDate(), sensor);
    })
  );
};

const downloadLogs = sensor => async dispatch => {
  dispatch(downloadLogsStart());

  const downloadedLogsResult = (await sensor?.downloadLogs()) ?? {};
  const { success = false, data = [] } = downloadedLogsResult;

  if (success && data?.[0]?.logs) {
    dispatch(downloadLogsComplete());
    return data?.[0]?.logs;
  }

  dispatch(downloadLogsError());
  return null;
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

  return success;
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

  return success;
};

const startSavingTemperatureLogs = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.START_SAVING_TEMPERATURE_LOGS,
});
const completeSavingTemperatureLogs = () => ({
  type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_SAVING_TEMPERATURE_LOGS,
});

const createTemperatureLogs = sensor => async dispatch => {
  const { sensorLogs, location, logInterval } = sensor;

  // Sensors have a minimum log interval of one minute on a physical device.
  const MIN_LOG_INTERVAL = 60;
  // Defensive against zero or less log interval.
  const intervalInSeconds = Math.max(logInterval, MIN_LOG_INTERVAL);
  // Each sensorLog is per log interval. A temperature log is a 30 minute aggregation.
  // Divide the time a sensorLog ranges over by 30 minutes to find the number of sensor
  // logs per temperature log.
  const sensorLogsPerTemperatureLog = Math.floor(
    MILLISECONDS.THIRTY_MINUTES / (intervalInSeconds * MILLISECONDS.ONE)
  );

  // Only create TemperatureLogs for the greatest multiple of 6 SensorLogs,
  // as each SensorLog is a 5 minute log, and each Temperature log a 30 minute log.
  const iterateTo = sensorLogs.length - (sensorLogs.length % sensorLogsPerTemperatureLog);
  const sensorLogsToGroup = sensorLogs.sorted('timestamp').slice(0, iterateTo);
  const groupedSensorLogs = chunk(sensorLogsToGroup, sensorLogsPerTemperatureLog);

  UIDatabase.write(() => {
    groupedSensorLogs.forEach(sensorLogGroup => {
      const { hasBreached, mostRecentTemperatureBreach } = sensor;
      const newLogTemperature = Math.min(...sensorLogGroup.map(({ temperature }) => temperature));
      const newLogTimestamp = new Date(
        Math.min(...sensorLogGroup.map(({ timestamp }) => timestamp))
      );

      const newLog = createRecord(
        UIDatabase,
        'TemperatureLog',
        newLogTemperature,
        newLogTimestamp,
        location
      );

      if (hasBreached) {
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
};

const errorNoSensors = () => ({ type: TEMPERATURE_SYNC_ACTIONS.ERROR_NO_SENSORS });
const startSync = () => ({ type: TEMPERATURE_SYNC_ACTIONS.START_SYNC });
const completeSync = () => ({ type: TEMPERATURE_SYNC_ACTIONS.COMPLETE_SYNC });
const updateSensorProgress = sensor => ({
  type: TEMPERATURE_SYNC_ACTIONS.UPDATE_SENSOR_PROGRESS,
  payload: { sensor },
});

const manualTemperatureSync = () => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

  if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
  if (!locationPermission) await dispatch(PermissionActions.requestLocation());

  dispatch(syncTemperatures());
};

const errorDisabledBluetooth = () => dispatch => {
  ToastAndroid.show(syncStrings.please_enable_bluetooth, ToastAndroid.LONG);
  dispatch({ type: TEMPERATURE_SYNC_ACTIONS.ERROR_BLUETOOTH_DISABLED });
};
const errorDisabledLocation = () => dispatch => {
  ToastAndroid.show(syncStrings.grant_location_permission, ToastAndroid.LONG);
  dispatch({ type: TEMPERATURE_SYNC_ACTIONS.ERROR_LOCATION_DISABLED });
};

const syncTemperatures = () => async (dispatch, getState) => {
  // Ensure not sync is currently in progress before initiating a new one.
  const { temperatureSync } = getState();
  const { isSyncing } = temperatureSync;
  if (isSyncing) return null;

  // Ensure the correct permissions before initiating a new sync process.
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

  if (!bluetoothEnabled) dispatch(errorDisabledBluetooth());
  if (!locationPermission) dispatch(errorDisabledLocation());
  if (!(bluetoothEnabled && locationPermission)) return null;

  // Ensure there are some sensors which have been assigned a location before syncing.
  const sensors = UIDatabase.objects('Sensor').filtered('location != null && isActive == true');
  const { length: numberOfSensors } = sensors;
  if (!numberOfSensors) return dispatch(errorNoSensors());

  // Begin a sync cycle: For each sensor, download the logs. Reset it's log
  //  frequency and advertisement frequency. Then, save the logs downloaded.
  dispatch(startSync());
  for (let i = 0; i < numberOfSensors; i++) {
    const sensor = sensors[i];

    dispatch(updateSensorProgress(sensor));
    const downloadedLogsResult = await dispatch(downloadLogs(sensor));

    if (downloadedLogsResult) {
      await dispatch(saveLogs(downloadedLogsResult, sensor));
      await dispatch(createTemperatureLogs(sensor));
      const resetLogFrequencyResult = await dispatch(resetLogFrequency(sensor));

      if (resetLogFrequencyResult) {
        await dispatch(resetAdvertisementFrequency(sensor));
      }
    }
  }
  return dispatch(completeSync());
};

export const TemperatureSyncActions = {
  syncTemperatures,
  openModal,
  closeModal,
  startSensorScan,
  manualTemperatureSync,
};
