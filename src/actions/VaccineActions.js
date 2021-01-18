/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import selectScannedSensors from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import { syncStrings } from '../localization/index';
import { UIDatabase } from '../database/index';

export const VACCINE_ACTIONS = {
  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_STOP: 'Vaccine/sensorScanStop',
  SENSOR_FOUND: 'Vaccine/sensorFound',
};

const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });
const sensorFound = macAddress => ({ type: VACCINE_ACTIONS.SENSOR_FOUND, payload: { macAddress } });

const startSensorScan = () => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());
  // Ensure the correct permissions before initiating a new sync process.
  if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
  if (!locationPermission) await dispatch(PermissionActions.requestLocation());

  if (!bluetoothEnabled) {
    ToastAndroid.show(syncStrings.please_enable_bluetooth, ToastAndroid.LONG);
    return null;
  }

  if (!locationPermission) {
    ToastAndroid.show(syncStrings.grant_location_permission, ToastAndroid.LONG);
    return null;
  }

  dispatch(scanForSensors());

  // Scan will continue running until it is stopped...
  return null;
};

const scanForSensors = () => async (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const { id } = device;
    console.log(id);

    if (id) {
      const alreadyFound = selectScannedSensors(getState());
      const alreadySaved = UIDatabase.get('Sensor', id, 'macAddress');

      if (!alreadyFound.includes(id) && !alreadySaved) {
        dispatch(sensorFound(id));
      }
    }
  };

  BleService().scanForSensors(deviceCallback);
};

const stopSensorScan = () => async dispatch => {
  dispatch(scanStop());
  BleService().stopScan();
};

export const TemperatureSyncActions = {
  startSensorScan,
  stopSensorScan,
};
