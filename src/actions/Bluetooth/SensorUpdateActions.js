/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import { PermissionActions } from '../PermissionActions';
import BleService from '../../bluetooth/BleService';
import { isValidMacAddress, VACCINE_CONSTANTS } from '../../utilities/modules/vaccines/index';
import { UIDatabase } from '../../database/index';
import { selectIsSyncingTemps } from '../../selectors/Bluetooth/sensorDownload';
import { vaccineStrings } from '../../localization/index';

export const UPDATE_ACTIONS = {
  SET_LOG_INTERVAL_ERROR: 'Bluetooth/setLogIntervalError',
  SET_LOG_INTERVAL_START: 'Bluetooth/setLogIntervalStart',
  SET_LOG_INTERVAL_SUCCESS: 'Bluetooth/setLogIntervalSuccess',
  DISABLE_BUTTON_START: 'Bluetooth/disableButtonStart',
  DISABLE_BUTTON_STOP: 'Bluetooth/disableButtonStop',
};

const setLogIntervalStart = macAddress => ({
  type: UPDATE_ACTIONS.SET_LOG_INTERVAL_START,
  payload: { macAddress },
});
const setLogIntervalSuccess = () => ({ type: UPDATE_ACTIONS.SET_LOG_INTERVAL_SUCCESS });

const setLogIntervalError = () => ({ type: UPDATE_ACTIONS.SET_LOG_INTERVAL_ERROR });

const disableButtonStart = macAddress => ({
  type: UPDATE_ACTIONS.DISABLE_BUTTON_START,
  payload: { macAddress },
});

const disableButtonStop = macAddress => ({
  type: UPDATE_ACTIONS.DISABLE_BUTTON_STOP,
  payload: { macAddress },
});

const setLogInterval = (macAddress, interval) => async dispatch => {
  dispatch(setLogIntervalStart(macAddress));

  try {
    const regex = new RegExp(`Interval: ${interval}s`); // TODO: update with sensor specific response as needed
    const error = `Sensor response was not equal to 'Interval: ${interval}s'`;
    const response = await BleService().updateLogIntervalWithRetries(
      macAddress,
      interval,
      VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
    );
    const action = regex.test(response.toString())
      ? setLogIntervalSuccess()
      : setLogIntervalError(error);
    await dispatch(action);
  } catch (e) {
    dispatch(setLogIntervalError(e));
    throw e;
  }
};

const disableSensorButton = macAddress => async dispatch => {
  dispatch(disableButtonStart(macAddress));
  try {
    const info = await BleService().getInfoWithRetries(
      macAddress,
      VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
    );
    if (!info.isDisabled) {
      await BleService().toggleButtonWithRetries(
        macAddress,
        VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
      );
      dispatch(disableButtonStop(macAddress));
    }
  } catch (error) {
    dispatch(disableButtonStop(macAddress));
    throw error;
  }
};

const startSensorDisableButton = macAddress => async (dispatch, getState) => {
  const result = await PermissionActions.withLocationAndBluetooth(
    dispatch,
    getState,
    disableSensorButton(macAddress)
  );
  return result;
};

const startSetLogInterval = ({ macAddress, logInterval = 300 }) => async (dispatch, getState) => {
  const result = await PermissionActions.withLocationAndBluetooth(
    dispatch,
    getState,
    setLogInterval(macAddress, logInterval)
  );
  return result;
};

const updateSensor = sensor => async (dispatch, getState) => {
  if (!isValidMacAddress(sensor.macAddress)) {
    // prevent errors if the sensor is not able to be contacted
    return;
  }

  const oldLogInterval = UIDatabase.get('Sensor', sensor.macAddress, 'macAddress')?.logInterval;
  if (oldLogInterval && sensor.logInterval === oldLogInterval) {
    // No updates required if no change
    return;
  }

  if (selectIsSyncingTemps(getState())) {
    throw new Error(vaccineStrings.E_DOWNLOAD_IN_PROGRESS);
  }

  await dispatch(SensorUpdateActions.startSetLogInterval(sensor));
  await dispatch(SensorUpdateActions.startSensorDisableButton(sensor.macAddress));
};

export const SensorUpdateActions = {
  startSensorDisableButton,
  startSetLogInterval,
  setLogInterval,
  updateSensor,
};
