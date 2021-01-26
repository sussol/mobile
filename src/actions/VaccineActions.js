/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import moment from 'moment';
import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { selectScannedSensors } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import TemperatureLogManager from '../bluetooth/TemperatureLogManager';
import { syncStrings, vaccineStrings } from '../localization';
import { UIDatabase } from '../database';
import SensorManager from '../bluetooth/SensorManager';
import { VACCINE_CONSTANTS } from '../utilities/modules/vaccines/index';
import { VACCINE_ENTITIES } from '../utilities/modules/vaccines/constants';

export const VACCINE_ACTIONS = {
  BLINK: 'Vaccine/blinkSensor',
  BLINK_START: 'Vaccine/blinkSensorStart',
  BLINK_STOP: 'Vaccine/blinkSensorStop',
  SAVE_SENSOR_ERROR: 'Vaccine/saveSensorError',
  SAVE_SENSOR_START: 'Vaccine/saveSensorStart',
  SAVE_SENSOR_SUCCESS: 'Vaccine/saveSensorSuccess',
  DOWNLOAD_LOGS_START: 'Vaccine/downloadLogsStart',
  DOWNLOAD_LOGS_ERROR: 'Vaccine/downloadLogsError',
  DOWNLOAD_LOGS_COMPLETE: 'Vaccine/downloadLogsComplete',
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
  SET_LOG_INTERVAL_ERROR: 'Vaccine/setLogIntervalError',
  SET_LOG_INTERVAL_START: 'Vaccine/setLogIntervalStart',
  SET_LOG_INTERVAL_SUCCESS: 'Vaccine/setLogIntervalSuccess',
  TOGGLE_BUTTON_START: 'Vaccine/toggleButtonStart',
  TOGGLE_BUTTON_STOP: 'Vaccine/toggleButtonStop',
};

const blinkStart = macAddress => ({ type: VACCINE_ACTIONS.BLINK_START, payload: { macAddress } });
const blinkStop = () => ({ type: VACCINE_ACTIONS.BLINK_STOP });
const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { macAddress } });
const downloadLogsStart = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_START,
});
const downloadLogsError = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR,
});
const downloadLogsComplete = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
});

const downloadAllLogs = () => async dispatch => {
  dispatch(downloadLogsStart());

  // Ensure there are some sensors which have been assigned a location before syncing.
  const sensors = UIDatabase.objects('Sensor').filtered('location != null && isActive == true');

  if (!sensors.length) {
    // TODO: Should we do something if there are errors?
    dispatch(downloadLogsError());
    return null;
  }

  for (let i = 0; i < sensors.length; i++) {
    // Intentionally sequential
    // eslint-disable-next-line no-await-in-loop
    await dispatch(downloadLogsFromSensor(sensors[i]));
  }
  dispatch(downloadLogsComplete());
  return null;
};

const downloadLogsFromSensor = sensor => async () => {
  const { macAddress, logInterval } = sensor;

  const downloadedLogsResult =
    (await BleService().downloadLogsWithRetries(
      macAddress,
      VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
    )) ?? {};

  if (downloadedLogsResult) {
    const savedTemperatureLogs = UIDatabase.objects(VACCINE_ENTITIES.TEMPERATURE_LOG)
      .filtered('sensor.macAddress == $0', macAddress)
      .sorted('timestamp', true);

    const [mostRecentLog] = savedTemperatureLogs;
    const mostRecentLogTime = mostRecentLog ? mostRecentLog.timestamp : null;
    const nextPossibleLogTime = mostRecentLogTime
      ? moment(mostRecentLogTime).add(logInterval, 's')
      : 0;

    const numberOfLogsToSave = await TemperatureLogManager().calculateNumberOfLogsToSave(
      logInterval,
      nextPossibleLogTime
    );

    const temperatureLogs = await TemperatureLogManager().createLogs(
      downloadedLogsResult,
      sensor,
      numberOfLogsToSave,
      mostRecentLogTime
    );

    await TemperatureLogManager().saveLogs(temperatureLogs);
  }

  return null;
};
const setLogIntervalStart = macAddress => ({
  type: VACCINE_ACTIONS.SET_LOG_INTERVAL_START,
  payload: { macAddress },
});
const setLogIntervalSuccess = () => ({ type: VACCINE_ACTIONS.SET_LOG_INTERVAL_SUCCESS });
const setLogIntervalError = () => ({ type: VACCINE_ACTIONS.SET_LOG_INTERVAL_ERROR });
const toggleButtonStart = macAddress => ({
  type: VACCINE_ACTIONS.TOGGLE_BUTTON_START,
  payload: { macAddress },
});
const toggleButtonStop = macAddress => ({
  type: VACCINE_ACTIONS.TOGGLE_BUTTON_STOP,
  payload: { macAddress },
});
const saveSensorError = () => ({ type: VACCINE_ACTIONS.SAVE_SENSOR_ERROR });
const saveSensorStart = macAddress => ({
  type: VACCINE_ACTIONS.SAVE_SENSOR_START,
  payload: { macAddress },
});
const saveSensorSuccess = () => ({ type: VACCINE_ACTIONS.SAVE_SENSOR_SUCCESS });

/**
 * Helper wrapper which will check permissions for
 * bluetooth & location services before calling the supplied function
 * @param {Func} dispatch
 * @param {Func} getState
 * @param {Func} func method to run if permissions are enabled
 */
const withPermissions = async (dispatch, getState, func) => {
  const state = getState();
  const bluetoothEnabled = PermissionSelectors.bluetooth(state);
  const locationPermission = PermissionSelectors.location(state);

  // Ensure the correct permissions before initiating a new sync process.
  if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
  if (!locationPermission) await dispatch(PermissionActions.requestLocation());

  if (!bluetoothEnabled) {
    ToastAndroid.show(syncStrings.bluetooth_disabled, ToastAndroid.LONG);
    return null;
  }

  if (!locationPermission) {
    ToastAndroid.show(syncStrings.location_permission, ToastAndroid.LONG);
    return null;
  }

  return func(dispatch, getState);
};

const blinkSensor = macAddress => async dispatch => {
  dispatch(blinkStart(macAddress));
  await BleService().blinkWithRetries(macAddress, VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS);
  dispatch(blinkStop(macAddress));
};

const scanForSensors = (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const { id: macAddress } = device;
    if (macAddress) {
      const alreadyScanned = selectScannedSensors(getState());
      const alreadySaved = UIDatabase.get('Sensor', macAddress, 'macAddress');

      if (!alreadyScanned?.includes(macAddress) && !alreadySaved) {
        dispatch(sensorFound(macAddress));
      }
    }
  };

  // Scan will continue running until it is stopped...
  BleService().scanForSensors(deviceCallback);
};

const startDownloadAllLogs = macAddress => async (dispatch, getState) => {
  await withPermissions(dispatch, getState, downloadAllLogs(macAddress));
  return null;
};

const setLogInterval = (macAddress, interval) => async dispatch => {
  dispatch(setLogIntervalStart(macAddress));
  const regex = new RegExp(`Interval: ${interval}s`); // TODO: update with sensor specific response as needed
  const error = `Sensor response was not equal to 'Interval: ${interval}s'`;

  return BleService()
    .updateLogInterval(macAddress, interval)
    .then(result => (regex.test(result) ? setLogIntervalSuccess() : setLogIntervalError(error)))
    .then(action => dispatch(action));
};

const saveSensor = sensor => async dispatch =>
  new Promise((resolve, reject) => {
    dispatch(saveSensorStart(sensor.macAddress));

    try {
      const { location, logInterval, macAddress, name } = sensor;
      const sensorManager = SensorManager();
      const newSensor = sensorManager.createSensor({ location, logInterval, macAddress, name });
      sensorManager.saveSensor(newSensor);
      dispatch(saveSensorSuccess());
      resolve();
    } catch (error) {
      dispatch(saveSensorError());
      reject(error);
    }
  });

const toggleSensorButton = macAddress => async dispatch => {
  dispatch(toggleButtonStart(macAddress));
  return BleService()
    .toggleButton(macAddress)
    .then(() => dispatch(toggleButtonStop(macAddress)))
    .catch(() => {
      throw new Error(vaccineStrings.E_SENSOR_SAVE);
    })
    .finally(() => {
      dispatch(toggleButtonStop(macAddress));
    });
};

const startSensorBlink = macAddress => async (dispatch, getState) => {
  await withPermissions(dispatch, getState, blinkSensor(macAddress));
  return null;
};

const startSensorScan = () => async (dispatch, getState) => {
  withPermissions(dispatch, getState, scanForSensors);
  return null;
};

const stopSensorScan = () => dispatch => {
  dispatch(scanStop());
  BleService().stopScan();
};

const startSensorToggleButton = macAddress => async (dispatch, getState) => {
  const success = await withPermissions(dispatch, getState, toggleSensorButton(macAddress));
  return success;
};

const startSetLogInterval = ({ macAddress, interval = 300 }) => async (dispatch, getState) => {
  const success = withPermissions(dispatch, getState, setLogInterval(macAddress, interval));
  return success;
};

export const VaccineActions = {
  blinkSensor,
  saveSensor,
  startDownloadAllLogs,
  startSensorBlink,
  startSensorScan,
  startSensorToggleButton,
  startSetLogInterval,
  stopSensorScan,
};
