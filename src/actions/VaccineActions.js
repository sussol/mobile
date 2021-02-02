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

const startDownloadAllLogs = () => async (dispatch, getState) => {
  // Ensure there isn't already a download in progress before starting a new one
  const state = getState();
  const isDownloadingLogs = selectIsDownloadingLogs(state);
  if (isDownloadingLogs) return null;

  await PermissionActions.withLocationAndBluetooth(dispatch, getState, downloadAllLogs());
  return null;
};

const updateSensor = sensor => async dispatch => {
  await dispatch(VaccineActions.startSetLogInterval(sensor));
  await dispatch(VaccineActions.startSensorDisableButton(sensor.macAddress));
};

export const VaccineActions = {
  updateSensor,
  startDownloadAllLogs,
};
