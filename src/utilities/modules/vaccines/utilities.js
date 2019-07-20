/* eslint-disable no-throw-literal */
/* eslint-disable import/prefer-default-export */

import { generateUUID } from 'react-native-database';

// Helpers for byte to int conversion
const RANGE_OF_16_BITS = 256 * 256;
const RANGE_OF_8_BITS = RANGE_OF_16_BITS / 2;

function toUnsignedInt(byteArray, startPosition) {
  return byteArray[startPosition] * 256 + byteArray[startPosition + 1];
}

function toInt(byteArray, startPosition) {
  const unsignedInt = toUnsignedInt(byteArray, startPosition);
  if (unsignedInt > RANGE_OF_8_BITS) return (RANGE_OF_16_BITS - unsignedInt) * -1;
  return unsignedInt;
}

export function parseDownloadedLogs(downloadedData) {
  let e = null;
  try {
    const temperatureReadings = [];
    const { rawResultLines } = downloadedData;
    const totalNumberOfRecords = toInt(rawResultLines[0], 4);
    for (let i = 1; i < rawResultLines.length; i += 1) {
      const line = rawResultLines[i];
      for (let y = 0; y < line.length; y += 2) {
        const reading = toInt(line, y);
        if (reading === 11308) {
          return {
            temperatureReadings,
            totalNumberOfRecords,
          };
        }
        temperatureReadings.push(reading);
      }
    }
  } catch (caughtError) {
    e = caughtError;
  }
  throw { code: 'failureparsing', description: 'failure while parsing', e };
}

export function integrateLogs(parsedLogs, sensor, database) {
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

  const logsToIntegrate = [];
  let nextIntegratingLogTimestanp = startOfIntegratingLogsTimestamp;

  for (let i = startingLogIndex; i < parsedLogs.length; i += 1) {
    logsToIntegrate.push({
      id: generateUUID(),
      temperature: parsedLogs[i] / 10,
      timestamp: new Date(nextIntegratingLogTimestanp),
      location,
    });
    nextIntegratingLogTimestanp += logIntervalMillisecods;
  }

  database.write(() => {
    logsToIntegrate.forEach(sensorLog => {
      const sLog = database.update('SensorLog', sensorLog);
      sensor.sensorLogs.push(sLog);
    });
  });

  return { rawIntegratedLogCount: logsToIntegrate.length };
}

export function genericErrorReturn(e) {
  let failData = e;

  if (!e.code) {
    failData = { code: 'unexpected', description: 'unexpected error', e };
  }
  return { success: false, failData };
}
