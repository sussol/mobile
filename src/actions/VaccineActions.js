/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { selectScannedAddresses } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import { syncStrings } from '../localization/index';
import { UIDatabase } from '../database/index';

export const VACCINE_ACTIONS = {
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
  BLINK: 'Vaccine/blinkSensor',
};

const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = sensor => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { sensor } });

const blinkSensor = macAddress => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

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

  await BleService()
    .blinkWithRetries(macAddress, 3)
    .catch(error => {
      const { message } = error;
      ToastAndroid.show(message || error, ToastAndroid.LONG);
    });

  return null;
};

const startSensorScan = () => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

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

  // Scan will continue running until it is stopped...
  return dispatch(scanForSensors());
};

const scanForSensors = () => (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const { id: macAddress, name } = device;

    if (macAddress) {
      const alreadyScanned = selectScannedAddresses(getState()).includes(macAddress);
      const alreadySaved = UIDatabase.get('Sensor', macAddress, 'macAddress');

      if (!alreadyScanned && !alreadySaved) {
        dispatch(sensorFound({ macAddress, name }));
      }
    }
  };

  BleService().scanForSensors(deviceCallback);
};

const stopSensorScan = () => dispatch => {
  dispatch(scanStop());
  BleService().stopScan();
};

export const VaccineActions = {
  blinkSensor,
  startSensorScan,
  stopSensorScan,
};
