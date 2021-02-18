/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

import moment from 'moment';
import { PermissionActions } from '../PermissionActions';
import BleService from '../../bluetooth/BleService';
import TemperatureLogManager from '../../bluetooth/TemperatureLogManager';
import SensorManager from '../../bluetooth/SensorManager';
import { UIDatabase } from '../../database';
import { isValidMacAddress, VACCINE_CONSTANTS } from '../../utilities/modules/vaccines/index';
import {
  DOWNLOADING_ERROR_CODES,
  VACCINE_ENTITIES,
} from '../../utilities/modules/vaccines/constants';
import { syncStrings } from '../../localization';
import { selectIsSyncingTemps } from '../../selectors/Bluetooth/sensorDownload';
import { BreachActions } from '../BreachActions';

export const DOWNLOAD_ACTIONS = {
  DOWNLOAD_LOGS_START: 'Bluetooth/downloadLogsStart',
  DOWNLOAD_LOGS_ERROR: 'Bluetooth/downloadLogsError',
  DOWNLOAD_LOGS_COMPLETE: 'Bluetooth/downloadLogsComplete',
  SENSOR_DOWNLOAD_START: 'Bluetooth/sensorDownloadStart',
  SENSOR_DOWNLOAD_SUCCESS: 'Bluetooth/sensorDownloadSuccess',
  SENSOR_DOWNLOAD_ERROR: 'Bluetooth/sensorDownloadError',
};

const downloadLogsStart = () => ({ type: DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_START });
const downloadLogsComplete = () => ({ type: DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_COMPLETE });
const downloadLogsError = error => ({
  type: DOWNLOAD_ACTIONS.DOWNLOAD_LOGS_ERROR,
  payload: { error },
});

const sensorDownloadStart = sensor => ({
  type: DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_START,
  payload: { sensor },
});

const sensorDownloadError = (sensor, error) => ({
  type: DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_ERROR,
  payload: { sensor, error },
});

const sensorDownloadSuccess = sensor => ({
  type: DOWNLOAD_ACTIONS.SENSOR_DOWNLOAD_SUCCESS,
  payload: { sensor },
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
    const sensor = sensors[i];
    if (isValidMacAddress(sensors[i].macAddress)) {
      // Intentionally sequential
      try {
        // eslint-disable-next-line no-await-in-loop
        await dispatch(downloadLogsFromSensor(sensor));
        // eslint-disable-next-line no-await-in-loop
        await dispatch(downloadInfoFromSensor(sensor));
      } catch (exception) {
        dispatch(downloadLogsError(exception.message));
      }
    } else {
      dispatch(sensorDownloadError(sensor, DOWNLOADING_ERROR_CODES.E_INVALID_MAC_FORMAT));
    }
  }
  // this will now overwrite the error message
  dispatch(downloadLogsComplete());
  return null;
};

const downloadLogsFromSensor = sensor => async dispatch => {
  try {
    const { macAddress, logInterval, logDelay, isPaused } = sensor;

    const timeNow = moment();

    if (timeNow.isAfter(moment(logDelay)) && !isPaused) {
      dispatch(sensorDownloadStart(sensor));

      try {
        const downloadedLogsResult =
          (await BleService().downloadLogsWithRetries(
            macAddress,
            VACCINE_CONSTANTS.MAX_BLUETOOTH_COMMAND_ATTEMPTS
          )) ?? {};

        if (downloadedLogsResult) {
          try {
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
            await dispatch(BreachActions.createConsecutiveBreaches(sensor));
          } catch (e) {
            dispatch(sensorDownloadError(sensor, DOWNLOADING_ERROR_CODES.E_CANT_CONNECT));
          }
        }
      } catch (e) {
        dispatch(sensorDownloadError(sensor, DOWNLOADING_ERROR_CODES.E_CANT_SAVE));
      }

      dispatch(sensorDownloadSuccess(sensor));
    }
  } catch (error) {
    dispatch(sensorDownloadError(sensor, DOWNLOADING_ERROR_CODES.E_UNKNOWN));
  }
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

const startDownloadAll = () => async (dispatch, getState) => {
  // Ensure there isn't already a download in progress before starting a new one
  const state = getState();
  const isSyncingTemps = selectIsSyncingTemps(state);
  if (isSyncingTemps) return null;

  await PermissionActions.withLocationAndBluetooth(dispatch, getState, downloadAll());
  return null;
};

export const SensorDownloadActions = {
  startDownloadAll,
};
