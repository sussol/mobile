/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import moment from 'moment';
import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { selectScannedSensors, selectIsDownloadingLogs } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import TemperatureLogManager from '../bluetooth/TemperatureLogManager';
import { syncStrings } from '../localization';
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
  DISABLE_BUTTON_START: 'Vaccine/disableButtonStart',
  DISABLE_BUTTON_STOP: 'Vaccine/disableButtonStop',
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
const disableButtonStart = macAddress => ({
  type: VACCINE_ACTIONS.DISABLE_BUTTON_START,
  payload: { macAddress },
});
const disableButtonStop = macAddress => ({
  type: VACCINE_ACTIONS.DISABLE_BUTTON_STOP,
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
 * @param {Func} action method to dispatch if permissions are enabled
 */
const withPermissions = async (dispatch, getState, action) => {
  try {
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

    return dispatch(action);
  } catch {
    return null;
  }
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

const startDownloadAllLogs = () => async (dispatch, getState) => {
  // Ensure there isn't already a download in progress before starting a new one
  const state = getState();
  const isDownloadingLogs = selectIsDownloadingLogs(state);
  if (isDownloadingLogs) return null;

  await withPermissions(dispatch, getState, downloadAllLogs());
  return null;
};

const setLogInterval = (macAddress, interval) => async dispatch => {
  dispatch(setLogIntervalStart(macAddress));

  try {
    const regex = new RegExp(`Interval: ${interval}s`); // TODO: update with sensor specific response as needed
    const error = `Sensor response was not equal to 'Interval: ${interval}s'`;
    const response = await BleService().updateLogIntervalWithRetries(macAddress, interval, 10);
    const action = regex.test(response.toString())
      ? setLogIntervalSuccess()
      : setLogIntervalError(error);
    await dispatch(action);
  } catch (e) {
    dispatch(setLogIntervalError(e));
    throw e;
  }
};

const saveSensor = sensor => async dispatch => {
  dispatch(saveSensorStart(sensor.macAddress));
  try {
    const { location, logInterval, macAddress, name } = sensor;
    const sensorManager = SensorManager();
    const newSensor = await sensorManager.createSensor({ location, logInterval, macAddress, name });
    await sensorManager.saveSensor(newSensor);
    dispatch(saveSensorSuccess());
  } catch (error) {
    dispatch(saveSensorError());
    throw error;
  }
};

const disableSensorButton = macAddress => async dispatch => {
  dispatch(disableButtonStart(macAddress));
  try {
    const info = await BleService().getInfoWithRetries(macAddress, 10);
    if (!info.isDisabled) {
      await BleService().toggleButtonWithRetries(macAddress, 10);
      dispatch(disableButtonStop(macAddress));
    }
  } catch (error) {
    dispatch(disableButtonStop(macAddress));
    throw error;
  }
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

const startSensorDisableButton = macAddress => async (dispatch, getState) => {
  const result = await withPermissions(dispatch, getState, disableSensorButton(macAddress));
  return result;
};

const startSetLogInterval = ({ macAddress, interval = 300 }) => async (dispatch, getState) => {
  const result = await withPermissions(dispatch, getState, setLogInterval(macAddress, interval));
  return result;
};

export const VaccineActions = {
  blinkSensor,
  saveSensor,
  startDownloadAllLogs,
  startSensorBlink,
  startSensorScan,
  startSensorDisableButton,
  startSetLogInterval,
  stopSensorScan,
  setLogInterval,
};
