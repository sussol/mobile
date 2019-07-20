/* eslint-disable no-throw-literal */
import { NativeModules } from 'react-native';
import { parseSensorAdvertisment } from './temperatureSensorHelpers';
import { parseDownloadedLogs, integrateLogs, genericErrorReturn } from './utilities';

const MANUFACTURER_ID = 307;
const SENSOR_SCAN_TIMEOUT = 10000;
const SENSOR_SYNC_CONNECTION_DELAY = 450;
const SENSOR_SYNC_NUMBER_OF_RECONNECTS = 11;
const SENSOR_SYNC_COMMAND_GET_LOGS = '*logall';

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
  const { macAddress } = sensor;
  const { BleTempoDisc } = NativeModules;
  try {
    const downloadedData = await BleTempoDisc.getUARTCommandResults(
      macAddress,
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
        ...integrateLogs(parsedLogs.temperatureReadings, sensor, database),
        totalNumberOfSyncedLogs: parsedLogs.totalNumberOfRecords,
      },
    };
  } catch (e) {
    return genericErrorReturn(e);
  }
}
