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
import { syncStrings } from '../localization/index';
import { UIDatabase } from '../database';
import { VACCINE_CONSTANTS } from '../utilities/modules/vaccines/index';
import { VACCINE_ENTITIES } from '../utilities/modules/vaccines/constants';

export const VACCINE_ACTIONS = {
  DOWNLOAD_LOGS_START: 'Vaccine/downloadLogsStart',
  DOWNLOAD_LOGS_ERROR: 'Vaccine/downloadLogsError',
  DOWNLOAD_LOGS_COMPLETE: 'Vaccine/downloadLogsComplete',
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
  BLINK: 'Vaccine/blinkSensor',
};

const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { macAddress } });
const downloadLogsStart = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_START,
});
// const downloadLogsError = () => ({ type: VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR });

const downloadLogsComplete = macAddress => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
  payload: { macAddress },
});

const downloadAllLogs = () => async dispatch => {
  dispatch(downloadLogsStart());

  // TEST CODE
  const sensor = {
    id: 'Hufflepuff Sensor One',
    macAddress: 'E7:6F:FC:15:13:F2',
    logInterval: 1800,
    location: { id: 'Hufflepuff location' },
  };
  const sensors = [sensor];

  sensors.forEach(async () => {
    await dispatch(downloadLogsFromSensor(sensor));
  });

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
    const nextPossibleLogTime = moment(mostRecentLogTime).add(logInterval, 's');

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

    console.log(temperatureLogs);
    await TemperatureLogManager().saveLogs(temperatureLogs);
  }

  // TODO: Figure out what to do if an error happens. Just ignore??
  // const { code = '' } = error;
  // dispatch(downloadLogsError(code));
  return null;
};

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

  return func(dispatch, state);
};

const blinkSensor = macAddress => () => {
  BleService().blinkWithRetries(macAddress, VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS);
};

const scanForSensors = (dispatch, state) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const { id: macAddress } = device;
    if (macAddress) {
      const alreadyScanned = selectScannedSensors(state);
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

export const VaccineActions = {
  startDownloadAllLogs,
  startSensorBlink,
  startSensorScan,
  stopSensorScan,
};
