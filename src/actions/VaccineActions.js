/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import moment from 'moment';
import { selectIsDownloadingLogs } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import TemperatureLogManager from '../bluetooth/TemperatureLogManager';
import { UIDatabase } from '../database';
import { VACCINE_CONSTANTS } from '../utilities/modules/vaccines/index';
import { VACCINE_ENTITIES } from '../utilities/modules/vaccines/constants';

export const VACCINE_ACTIONS = {
  DOWNLOAD_LOGS_START: 'Vaccine/downloadLogsStart',
  DOWNLOAD_LOGS_ERROR: 'Vaccine/downloadLogsError',
  DOWNLOAD_LOGS_COMPLETE: 'Vaccine/downloadLogsComplete',
  SET_LOG_INTERVAL_ERROR: 'Vaccine/setLogIntervalError',
  SET_LOG_INTERVAL_START: 'Vaccine/setLogIntervalStart',
  SET_LOG_INTERVAL_SUCCESS: 'Vaccine/setLogIntervalSuccess',
  DISABLE_BUTTON_START: 'Vaccine/disableButtonStart',
  DISABLE_BUTTON_STOP: 'Vaccine/disableButtonStop',
};

const downloadLogsStart = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_START,
});
const downloadLogsError = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR,
});
const downloadLogsComplete = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
});

const downloadAllLogs = () => async dispatch => {
  dispatch(downloadLogsStart());
  // Ensure there are some sensors which have been assigned a location before syncing.
  const sensors = UIDatabase.objects('Sensor').filtered('location != null && isActive == true');

  if (!sensors.length) {
    // TODO: Should we do something if there are errors?
    dispatch(downloadLogsError());
    return null;
  }

  for (let i = 0; i < sensors.length; i++) {
    // Intentionally sequential
    // eslint-disable-next-line no-await-in-loop
    await dispatch(downloadLogsFromSensor(sensors[i]));
  }
  dispatch(downloadLogsComplete());
  return null;
};

const downloadLogsFromSensor = sensor => async () => {
  const { macAddress, logInterval } = sensor;

  const downloadedLogsResult =
    (await BleService().downloadLogsWithRetries(
      macAddress,
      VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
    )) ?? {};

  if (downloadedLogsResult) {
    const savedTemperatureLogs = UIDatabase.objects(VACCINE_ENTITIES.TEMPERATURE_LOG)
      .filtered('sensor.macAddress == $0', macAddress)
      .sorted('timestamp', true);

    const [mostRecentLog] = savedTemperatureLogs;
    const mostRecentLogTime = mostRecentLog ? mostRecentLog.timestamp : null;
    const nextPossibleLogTime = mostRecentLogTime
      ? moment(mostRecentLogTime).add(logInterval, 's')
      : 0;

    const numberOfLogsToSave = await TemperatureLogManager().calculateNumberOfLogsToSave(
      logInterval,
      nextPossibleLogTime
    );

    const temperatureLogs = await TemperatureLogManager().createLogs(
      downloadedLogsResult,
      sensor,
      numberOfLogsToSave,
      mostRecentLogTime
    );

    await TemperatureLogManager().saveLogs(temperatureLogs);
  }

  return null;
};
const setLogIntervalStart = macAddress => ({
  type: VACCINE_ACTIONS.SET_LOG_INTERVAL_START,
  payload: { macAddress },
});
const setLogIntervalSuccess = () => ({ type: VACCINE_ACTIONS.SET_LOG_INTERVAL_SUCCESS });
const setLogIntervalError = () => ({ type: VACCINE_ACTIONS.SET_LOG_INTERVAL_ERROR });
const disableButtonStart = macAddress => ({
  type: VACCINE_ACTIONS.DISABLE_BUTTON_START,
  payload: { macAddress },
});
const disableButtonStop = macAddress => ({
  type: VACCINE_ACTIONS.DISABLE_BUTTON_STOP,
  payload: { macAddress },
});

const startDownloadAllLogs = () => async (dispatch, getState) => {
  // Ensure there isn't already a download in progress before starting a new one
  const state = getState();
  const isDownloadingLogs = selectIsDownloadingLogs(state);
  if (isDownloadingLogs) return null;

  await PermissionActions.withLocationAndBluetooth(dispatch, getState, downloadAllLogs());
  return null;
};

const setLogInterval = (macAddress, interval) => async dispatch => {
  dispatch(setLogIntervalStart(macAddress));

  try {
    const regex = new RegExp(`Interval: ${interval}s`); // TODO: update with sensor specific response as needed
    const error = `Sensor response was not equal to 'Interval: ${interval}s'`;
    const response = await BleService().updateLogIntervalWithRetries(macAddress, interval, 10);
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
    const info = await BleService().getInfoWithRetries(macAddress, 10);
    if (!info.isDisabled) {
      await BleService().toggleButtonWithRetries(macAddress, 10);
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

const startSetLogInterval = ({ macAddress, interval = 300 }) => async (dispatch, getState) => {
  const result = await PermissionActions.withLocationAndBluetooth(
    dispatch,
    getState,
    setLogInterval(macAddress, interval)
  );
  return result;
};

const updateSensor = sensor => async dispatch => {
  await dispatch(VaccineActions.startSetLogInterval(sensor));
  await dispatch(VaccineActions.startSensorDisableButton(sensor.macAddress));
};

export const VaccineActions = {
  updateSensor,
  startDownloadAllLogs,
  startSensorDisableButton,
  startSetLogInterval,
  setLogInterval,
};
