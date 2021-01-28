/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { batch } from 'react-redux';
import { BluetoothStatus } from 'react-native-bluetooth-status';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { ToastAndroid } from 'react-native';
import { PermissionSelectors } from '../selectors/permission';
import { syncStrings } from '../localization/index';

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
  BluetoothStatus.enable();
  const result = await BluetoothStatus.state();

  dispatch(setBluetooth(result));
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

  if (!locationPermission) {
    const result = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
    dispatch(setLocation(result === RESULTS.GRANTED));
  }
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

/**
 * Helper wrapper which will check permissions for
 * bluetooth & location services before calling the supplied function
 * @param {Func} dispatch
 * @param {Func} getState
 * @param {Func} action method to dispatch if permissions are enabled
 */
const withLocationAndBluetooth = async (dispatch, getState, action) => {
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

export const PermissionActions = {
  requestLocation,
  requestWriteStorage,
  requestBluetooth,
  setLocation,
  setWriteStorage,
  checkPermissions,
  withLocationAndBluetooth,
};
