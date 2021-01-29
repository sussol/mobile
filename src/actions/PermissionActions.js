/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

import { PermissionSelectors } from '../selectors/permission';

export const PERMISSION_ACTIONS = {
  SET_LOCATION: 'permissionActions/setLocation',
  SET_WRITE_STORAGE: 'permissionActions/setWriteStorage',
  SET_BLUETOOTH: 'permissionActions/setBluetooth',
};

const setBluetooth = status => ({ type: PERMISSION_ACTIONS.SET_BLUETOOTH, payload: { status } });
const setLocation = status => ({ type: PERMISSION_ACTIONS.SET_LOCATION, payload: { status } });
const setWriteStorage = status => ({
  type: PERMISSION_ACTIONS.SET_WRITE_STORAGE,
  payload: { status },
});

const requestBluetooth = () => async dispatch => {
  const isEmulator = await DeviceInfo.isEmulator();
  BluetoothStatus.enable();

  const result = isEmulator ? true : await BluetoothStatus.state();

  dispatch(setBluetooth(result));

  return result;
};

const requestWriteStorage = () => async (dispatch, getState) => {
  const writeStoragePermission = PermissionSelectors.writeStorage(getState());

  if (!writeStoragePermission) {
    const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    dispatch(setWriteStorage(result === RESULTS.GRANTED));
  }
};

const requestLocation = () => async (dispatch, getState) => {
  const locationPermission = PermissionSelectors.location(getState());

  const result = !locationPermission
    ? await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION)
    : true;

  dispatch(setLocation(result === RESULTS.GRANTED));

  return result;
};

const checkPermissions = () => async dispatch => {
  const promises = [
    check(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION),
    check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
    BluetoothStatus.state(),
  ];

  const [locationPermission, writeStoragePermission, bluetoothState] = await Promise.all(promises);

  batch(() => {
    dispatch(setLocation(locationPermission === RESULTS.GRANTED));
    dispatch(setWriteStorage(writeStoragePermission === RESULTS.GRANTED));
    dispatch(setBluetooth(bluetoothState));
  });
};

export const PermissionActions = {
  requestLocation,
  requestWriteStorage,
  requestBluetooth,
  setLocation,
  setWriteStorage,
  checkPermissions,
};
