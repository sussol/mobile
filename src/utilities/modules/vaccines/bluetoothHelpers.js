/* eslint-disable no-throw-literal */
import { NativeModules } from 'react-native';
import {
  parseDownloadedLogs,
  createSensorLogs,
  genericErrorReturn,
  parseSensorAdvertisment,
} from './utilities';

const MANUFACTURER_ID = 307;
const SENSOR_SCAN_TIMEOUT = 10000;
const SENSOR_SYNC_CONNECTION_DELAY = 450;
const SENSOR_SYNC_NUMBER_OF_RECONNECTS = 11;
const SENSOR_SYNC_COMMAND_GET_LOGS = '*logall';

const SENOSOR_SYNC_COMMAND_RESET_INTERVAL = '*lint240'; // 4 minutes
const SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL = '*sadv1000';

export async function sendSensorCommand({
  sensor,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
  command,
}) {
  const { macAddress } = sensor;

  const { BleTempoDisc } = NativeModules;
  try {
    const result = await BleTempoDisc.getUARTCommandResults(macAddress, command, delay, retries);

    if (!result) {
      throw {
        code: 'communicationerror',
        description: 'failed to communicate with sensor while sending UART command',
        macAddress,
        command,
      };
    }
  } catch (e) {
    return genericErrorReturn(e);
  }

  return { success: true };
}

export async function resetSensorInterval({
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  return sendSensorCommand({
    sensor,
    connectionDelay,
    numberOfReconnects,
    command: SENOSOR_SYNC_COMMAND_RESET_INTERVAL,
  });
}

export async function resetSensorAdvertismentFrequency({
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  return sendSensorCommand({
    sensor,
    connectionDelay,
    numberOfReconnects,
    command: SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL,
  });
}

/* eslint-disable import/prefer-default-export */
export async function scanForSensors() {
  // Initiate a BLE scan for devices, returning all sensors found
  // which match the provided manufacturers ID. Returns an array
  // of sensor advertisement data from all sensors found. In the
  // shape:
  // { batteryLevel, temperature, logInterval, numberOfLogs
  //   lastConnectionTimestamp, name, macAddress }
  // @@TODO: Check return
  try {
    const { BleTempoDisc } = NativeModules;
    const sensors = await BleTempoDisc.getDevices(MANUFACTURER_ID, SENSOR_SCAN_TIMEOUT, '');
    return Object.entries(sensors).map(([macAddress, { name, advertismentData }]) => ({
      ...parseSensorAdvertisment(advertismentData),
      macAddress,
      name,
    }));
  } catch (e) {
    // @@TODO: Check error objects, log to bugsnag
    return null;
  }
}

export async function syncSensorLogs({
  database,
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  try {
    const downloadedData = await sendSensorCommand(
      sensor,
      SENSOR_SYNC_COMMAND_GET_LOGS,
      connectionDelay,
      numberOfReconnects
    );

    if (!downloadedData || !downloadedData.success) {
      throw { code: 'syncdata', description: 'failed to sync data from sensor' };
    }
    const parsedLogs = parseDownloadedLogs(downloadedData);
    return {
      success: true,
      data: {
        ...createSensorLogs(parsedLogs.temperatureReadings, sensor, database),
        totalNumberOfSyncedLogs: parsedLogs.totalNumberOfRecords,
      },
    };
  } catch (e) {
    return genericErrorReturn(e);
  }
}
