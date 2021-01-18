/* eslint-disable no-await-in-loop */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { PermissionSelectors } from '../selectors/permission';
import selectScannedSensors from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';

export const VACCINE_ACTIONS = {
  ERROR_BLUETOOTH_DISABLED: 'Vaccine/errorBluetoothDisabled',
  ERROR_LOCATION_DISABLED: 'Vaccine/errorLocationDisabled',

  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_ERROR: 'Vaccine/sensorScanError',
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

  if (!(bluetoothEnabled && locationPermission)) return null;
  dispatch(scanForSensors());

  // Do we need to do something here?
  return null;
};

const scanForSensors = () => async (dispatch, getState) => {
  dispatch(scanStart());

  const deviceCallback = device => {
    const alreadyFound = selectScannedSensors(getState());

    // TODO: Filter out already saved sensors?
    if (!alreadyFound.includes(device?.id)) {
      dispatch(sensorFound(device?.id));
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
