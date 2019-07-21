/* eslint-disable no-throw-literal */
/* eslint-disable import/prefer-default-export */

import { generateUUID } from 'react-native-database';

// Helpers for byte to int conversion
const RANGE_OF_16_BITS = 256 * 256;
const RANGE_OF_8_BITS = RANGE_OF_16_BITS / 2;
const SENSOR_LOG_DELIMITER_BYTE = 11308;

function toUnsignedInt(byteArray, startPosition) {
  return byteArray[startPosition] * 256 + byteArray[startPosition + 1];
}

function toInt(byteArray, startPosition) {
  const unsignedInt = toUnsignedInt(byteArray, startPosition);
  if (unsignedInt > RANGE_OF_8_BITS) return (RANGE_OF_16_BITS - unsignedInt) * -1;
  return unsignedInt;
}

export function parseDownloadedLogs(sensorLogData) {
  const { rawResultLines } = sensorLogData;
  const flattenedResultLines = rawResultLines.reduce((acc, value) => [...acc, ...value], []);
  const temperatureReadings = [];

  for (let i = 0; i < flattenedResultLines.length; i += 2) {
    const reading = toInt(flattenedResultLines, i);
    if (reading === SENSOR_LOG_DELIMITER_BYTE) break;
    temperatureReadings.push(reading / 10);
  }
  return temperatureReadings;
}

export function parseSensorAdvertisment(advertismentData) {
  return {
    batteryLevel: advertismentData[8],
    temperature: toInt(advertismentData, 13) / 10.0,
    logInterval: toInt(advertismentData, 9),
    numberOfLogs: toInt(advertismentData, 11),
    lastConnectionTimestamp: new Date(),
  };
}

export function createSensorLogs(parsedLogs, sensor, database) {
  // logInterval is in seconds
  const { logInterval, location, sensorLogs } = sensor;

  const logIntervalMillisecods = logInterval * 1000;
  const currentDateMilliseconds = new Date().getTime();

  let lookBackNumberOfLogs = parsedLogs.length;

  let startOfIntegratingLogsTimestamp =
    currentDateMilliseconds - logIntervalMillisecods * lookBackNumberOfLogs;

  if (sensorLogs.length > 0) {
    const latestLogTimestamp = sensorLogs.max('timestamp');
    if (latestLogTimestamp > startOfIntegratingLogsTimestamp) {
      lookBackNumberOfLogs = Math.floor(
        (currentDateMilliseconds - latestLogTimestamp) / logIntervalMillisecods - 1
      );
      startOfIntegratingLogsTimestamp =
        currentDateMilliseconds - lookBackNumberOfLogs * logIntervalMillisecods;
    }
  }

  const startingLogIndex = parsedLogs.length - lookBackNumberOfLogs;
  const logsToIntegrate = parsedLogs
    .slice(startingLogIndex, parsedLogs.length)
    .map((parsedLog, i) => ({
      id: generateUUID(),
      temperature: parsedLog,
      timestamp: new Date(startOfIntegratingLogsTimestamp + logIntervalMillisecods * i),
      location,
    }));

  database.write(() => {
    logsToIntegrate.forEach(sensorLog => {
      const sLog = database.update('SensorLog', sensorLog);
      sensor.sensorLogs.push(sLog);
    });
  });

  return { numberOfLogsCreated: logsToIntegrate.length };
}

export function genericErrorReturn(e) {
  let failData = e;

  if (!e.code) {
    failData = { code: 'unexpected', description: 'unexpected error', e };
  }
  return { success: false, failData };
}
