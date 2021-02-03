/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { PermissionActions } from '../PermissionActions';
import BleService from '../../bluetooth/BleService';
import { VACCINE_CONSTANTS } from '../../utilities/modules/vaccines/index';

export const BLINK_ACTIONS = {
  BLINK: 'Bluetooth/blinkSensor',
  BLINK_START: 'Bluetooth/blinkSensorStart',
  BLINK_STOP: 'Bluetooth/blinkSensorStop',
};

const blinkStart = macAddress => ({ type: BLINK_ACTIONS.BLINK_START, payload: { macAddress } });
const blinkStop = () => ({ type: BLINK_ACTIONS.BLINK_STOP });

const blinkSensor = macAddress => async dispatch => {
  dispatch(blinkStart(macAddress));
  await BleService().blinkWithRetries(macAddress, VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS);
  dispatch(blinkStop(macAddress));
};

const startSensorBlink = macAddress => async (dispatch, getState) => {
  await PermissionActions.withLocationAndBluetooth(dispatch, getState, blinkSensor(macAddress));
  return null;
};

export const SensorBlinkActions = {
  startSensorBlink,
};
