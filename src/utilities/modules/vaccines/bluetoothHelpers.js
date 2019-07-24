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

const SENSOR_SYNC_COMMAND_RESET_INTERVAL = '*lint240'; // 4 minutes
const SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL = '*sadv1000';

/**
 * Sends the provided command to a provided sensor.
 * Optional delay and retries parameters for the number
 * of retry attempts to connect to a sensor and the delay
 * between each retry for failed attempts.
 */
export async function sendSensorCommand({
  sensor,
  command,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  const { macAddress } = sensor;
  const { BleTempoDisc } = NativeModules;

  try {
    const result = await BleTempoDisc.getUARTCommandResults(macAddress, command, delay, retries);
    console.log(result);
    if (!(result && result.success)) {
      throw {
        code: 'communicationerror',
        description: 'failed to communicate with sensor while sending UART command',
        macAddress,
        command,
      };
    }
    return { success: true };
  } catch (e) {
    return genericErrorReturn(e);
  }
}

/**
 * Resets the logging interval on a provided sensor.
 * This command is a setter for the logging interval,
 * but doubles as a reset/delete command as all logs
 * are removed once the interval is set.
 *
 * The command itself - *lint240 holds the new logging
 * interval in seconds.
 */
export async function resetInterval({
  sensor,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  const command = SENSOR_SYNC_COMMAND_RESET_INTERVAL;
  return sendSensorCommand({ sensor, delay, retries, command });
}

/**
 * Resets the advertisement frequency of a sensor.
 *
 * The command itself - *sadv1000 contains the new
 * logging frequency of 1 second.
 */
export async function resetAdvertismentFrequency({
  sensor,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  const command = SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL;
  return sendSensorCommand({ sensor, delay, retries, command });
}

/**
 * Initiate a BLE scan for devices, returning status data
 * of the provided sensor passed. If no sensor is passed,
 * a scan for all sensors matching the default manufacturer
 * ID will be initiated. Status data example
 * @param {{sensor}} sensor Realm sensor object to scan for
 * @returns {[{
 * batteryLevel:Number,
 * temperature:Number,
 * logInterval:Number,
 * numberOfLogs:Number,
 *  lastConnectionTimestamp:Date,
 * name:String,
 * macAddress:String
 * }]}
 */
export async function scanForSensor({ sensor = {} } = {}) {
  const { macAddress: address = '' } = sensor;
  try {
    const { BleTempoDisc } = NativeModules;
    const result = await BleTempoDisc.getDevices(MANUFACTURER_ID, SENSOR_SCAN_TIMEOUT, address);
    if (!result) return null;
    return Object.entries(result).map(([macAddress, { name, advertismentData }]) => ({
      ...parseSensorAdvertisment(advertismentData),
      macAddress,
      name,
    }));
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Downloads logs from a provided sensor.
 */
export async function downloadLogs({
  sensor,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  try {
    const downloadedData = await sendSensorCommand(
      sensor,
      SENSOR_SYNC_COMMAND_GET_LOGS,
      delay,
      retries
    );

    if (!downloadedData || !downloadedData.success) {
      throw { code: 'syncdata', description: 'failed to sync data from sensor' };
    }

    return downloadedData;
  } catch (error) {
    return genericErrorReturn(error);
  }
}

export async function syncSensorLogs({
  database,
  sensor,
  delay = SENSOR_SYNC_CONNECTION_DELAY,
  retries = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  const result = downloadLogs({ sensor, delay, retries });

  if (!(result && result.success)) return result;

  const parsedLogs = parseDownloadedLogs(result);
  return {
    success: true,
    data: {
      ...createSensorLogs(parsedLogs.temperatureReadings, sensor, database),
      totalNumberOfSyncedLogs: parsedLogs.totalNumberOfRecords,
    },
  };
}
