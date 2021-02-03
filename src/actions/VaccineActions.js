/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import moment from 'moment';
import { selectIsSyncingTemps } from '../selectors/vaccine';
import { PermissionActions } from './PermissionActions';
import BleService from '../bluetooth/BleService';
import TemperatureLogManager from '../bluetooth/TemperatureLogManager';
import SensorManager from '../bluetooth/SensorManager';
import { UIDatabase } from '../database';
import { VACCINE_CONSTANTS } from '../utilities/modules/vaccines/index';
import { VACCINE_ENTITIES } from '../utilities/modules/vaccines/constants';
import { syncStrings } from '../localization';

export const VACCINE_ACTIONS = {
  DOWNLOAD_LOGS_START: 'Vaccine/downloadLogsStart',
  DOWNLOAD_LOGS_ERROR: 'Vaccine/downloadLogsError',
  DOWNLOAD_LOGS_COMPLETE: 'Vaccine/downloadLogsComplete',
};

const downloadLogsStart = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_START,
});
const downloadLogsError = error => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_ERROR,
  payload: { error },
});
const downloadLogsComplete = () => ({
  type: VACCINE_ACTIONS.DOWNLOAD_LOGS_COMPLETE,
});

const downloadAll = () => async dispatch => {
  dispatch(downloadLogsStart());
  // Ensure there are some sensors which have been assigned a location before syncing.
  const sensors = UIDatabase.objects('Sensor').filtered('location != null && isActive == true');

  if (!sensors.length) {
    dispatch(downloadLogsError(syncStrings.no_sensors));
    return null;
  }

  for (let i = 0; i < sensors.length; i++) {
    // Intentionally sequential
    try {
      // eslint-disable-next-line no-await-in-loop
      await dispatch(downloadLogsFromSensor(sensors[i]));
      // eslint-disable-next-line no-await-in-loop
      await dispatch(downloadInfoFromSensor(sensors[i]));
    } catch (exception) {
      dispatch(downloadLogsError(exception.message));
    }
  }
  // this will now overwrite the error message
  dispatch(downloadLogsComplete());
  return null;
};

const downloadInfoFromSensor = sensor => async () => {
  const { macAddress } = sensor;
  const sensorInfo =
    (await BleService().getInfoWithRetries(
      macAddress,
      VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
    )) ?? {};

  if (sensorInfo) {
    // creating a new object to allow mutating.
    // cannot use spread operator down here
    const updatedSensor = SensorManager().sensorCreator(sensor);
    updatedSensor.batteryLevel = parseInt(sensorInfo.batteryLevel, 10);

    await SensorManager().saveSensor(updatedSensor);
  }

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

const startDownloadAll = () => async (dispatch, getState) => {
  // Ensure there isn't already a download in progress before starting a new one
  const state = getState();
  const isSyncingTemps = selectIsSyncingTemps(state);
  if (isSyncingTemps) return null;

  await PermissionActions.withLocationAndBluetooth(dispatch, getState, downloadAll());
  return null;
};

export const VaccineActions = {
  startDownloadAll,
};
