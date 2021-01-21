/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { selectScannedSensors } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService, { stringFromBase64 } from '../bluetooth/BleService';
import { BLUETOOTH } from '../bluetooth/constants';
import { syncStrings } from '../localization/index';
import { UIDatabase } from '../database/index';

export const VACCINE_ACTIONS = {
  BLINK: 'Vaccine/blinkSensor',
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
  SET_LOG_FREQUENCY_ERROR: 'Vaccine/setLogFrequencyError',
  SET_LOG_FREQUENCY_START: 'Vaccine/setLogFrequencyStart',
  SET_LOG_FREQUENCY_SUCCESS: 'Vaccine/setLogFrequencySuccess',
};

const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { macAddress } });
const setLogFrequencyStart = macAddress => ({
  type: VACCINE_ACTIONS.SET_LOG_FREQUENCY_START,
  payload: { macAddress },
});
const setLogFrequencySuccess = () => ({ type: VACCINE_ACTIONS.SET_LOG_FREQUENCY_SUCCESS });
const setLogFrequencyError = () => ({ type: VACCINE_ACTIONS.SET_LOG_FREQUENCY_ERROR });

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
  BleService().blinkWithRetries(macAddress, 3);
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

const setLogFrequency = (macAddress, frequency) => async dispatch => {
  let error;
  dispatch(setLogFrequencyStart(macAddress));

  const result = await BleService().updateLogIntervalWithRetries(macAddress, frequency, 3, error);
  const regex = new RegExp(`${BLUETOOTH.COMMANDS.UPDATE_LOG_INTERVAL}${frequency}`);
  const ok = regex.test(stringFromBase64(result));

  if (ok) dispatch(setLogFrequencySuccess());
  else dispatch(setLogFrequencyError(error));

  return ok;
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

const startSetLogFrequency = async ({ macAddress, frequency }) => async (dispatch, getState) => {
  const success = await withPermissions(dispatch, getState, setLogFrequency(macAddress, frequency));
  return success;
};

export const VaccineActions = {
  startSensorBlink,
  startSensorScan,
  startSetLogFrequency,
  stopSensorScan,
};
