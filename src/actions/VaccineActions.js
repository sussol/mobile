/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { selectScannedSensors } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import { syncStrings } from '../localization';
import { UIDatabase } from '../database';

export const VACCINE_ACTIONS = {
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
  BLINK_START: 'Vaccine/blinkSensorStart',
  BLINK_STOP: 'Vaccine/blinkSensorStop',
  BLINK: 'Vaccine/blinkSensor',
};

const blinkStart = macAddress => ({ type: VACCINE_ACTIONS.BLINK_START, payload: { macAddress } });
const blinkStop = macAddress => ({ type: VACCINE_ACTIONS.BLINK_STOP, payload: { macAddress } });
const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { macAddress } });

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
  await BleService().blinkWithRetries(macAddress, 3);
  dispatch(blinkStop(macAddress));
};

const scanForSensors = (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const { id: macAddress } = device;

    if (macAddress) {
      const alreadyScanned = selectScannedSensors(getState());
      const alreadySaved = UIDatabase.get('Sensor', macAddress, 'macAddress');

      console.log(alreadyScanned, macAddress);

      if (!alreadyScanned?.includes(macAddress) && !alreadySaved) {
        dispatch(sensorFound(macAddress));
      }
    }
  };

  // Scan will continue running until it is stopped...
  BleService().scanForSensors(deviceCallback);
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
  startSensorBlink,
  blinkSensor,
  startSensorScan,
  stopSensorScan,
};
