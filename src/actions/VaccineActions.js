/* eslint-disable no-await-in-loop */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { PermissionSelectors } from '../selectors/permission';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';

export const VACCINE_ACTIONS = {
  ERROR_BLUETOOTH_DISABLED: 'Vaccine/errorBluetoothDisabled',
  ERROR_LOCATION_DISABLED: 'Vaccine/errorLocationDisabled',

  SCAN_START: 'Vaccine/sensorScanStart',
  SCAN_COMPLETE: 'Vaccine/sensorScanComplete',
  SCAN_ERROR: 'Vaccine/sensorScanError',
  SCAN_STOP: 'Vaccine/sensorScanStop',

  BLINK: 'Vaccine/blinkSensor',
};

const scanStart = () => ({ type: VACCINE_ACTIONS.SCAN_START });
// eslint-disable-next-line no-unused-vars
const scanStop = () => ({ type: VACCINE_ACTIONS.SCAN_STOP });

const blinkSensorAction = macAddress => ({ type: VACCINE_ACTIONS.BLINK, payload: { macAddress } });

const blinkSensor = macAddress => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());

  // Ensure the correct permissions before initiating a new sync process.
  if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
  if (!locationPermission) await dispatch(PermissionActions.requestLocation());

  if (!(bluetoothEnabled && locationPermission)) return null;
  await dispatch(blinkSensorAction(macAddress));
  // TODO
  return null;
};

const startSensorScan = () => async (dispatch, getState) => {
  const bluetoothEnabled = PermissionSelectors.bluetooth(getState());
  const locationPermission = PermissionSelectors.location(getState());
  // Ensure the correct permissions before initiating a new sync process.
  if (!bluetoothEnabled) await dispatch(PermissionActions.requestBluetooth());
  if (!locationPermission) await dispatch(PermissionActions.requestLocation());

  if (!(bluetoothEnabled && locationPermission)) return null;
  await dispatch(scanForSensors());
  // TODO
  return null;
};

const scanForSensors = () => dispatch => {
  dispatch(scanStart());
  const deviceCallback = () => {
    // console.log(device);
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
