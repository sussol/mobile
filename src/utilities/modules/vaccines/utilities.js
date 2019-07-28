/* eslint-disable no-throw-literal */
/* eslint-disable import/prefer-default-export */

import { generateUUID } from 'react-native-database';

const SENSOR_LOG_FULL_AGGREGATE_TYPE = 'aggregate';

function createGenericSensorLog({
  sensor,
  location,
  temperature,
  isInBreach = false,
  aggregation,
  itemBatches,
  timestamp,
}) {
  return {
    id: generateUUID(),
    sensor,
    location,
    temperature,
    isInBreach,
    aggregation,
    itemBatches,
    timestamp,
  };
}

/**
 *
 * @param {Array} SensorLogGroup
 */
export function createFullAggregateSensorLogs(sensorLogGroup) {
  const medianSensorLog = sensorLogGroup[Math.floor(sensorLogGroup.length / 2)];
  const temperatures = sensorLogGroup.map(({ temperature }) => temperature);
  return [
    createGenericSensorLog({
      ...medianSensorLog,
      aggregation: SENSOR_LOG_FULL_AGGREGATE_TYPE,
      temperature: Math.max(...temperatures),
    }),
    createGenericSensorLog({
      ...medianSensorLog,
      aggregation: SENSOR_LOG_FULL_AGGREGATE_TYPE,
      temperature: Math.min(...temperatures),
    }),
  ];
}

export function linkSensorLogToItemBatches({ sensorLog, database }) {
  const { location } = sensorLog;
  if (!location) return;
  const itemBatches = location.getItemBatchesWithQuantity(database);
  if (!itemBatches || itemBatches.length === 0) return;
  database.update('SensorLog', {
    ...sensorLog,
    itemBatches,
  });
  itemBatches.forEach(itemBatch => {
    itemBatch.addSensorLog(sensorLog);
    database.update('SensorLogItemBatchJoin', {
      id: generateUUID(),
      itemBatch,
      sensorLog,
    });
  });
}

export function createSensorLogs({ parsedLogs, sensor, database }) {
  // logInterval is in seconds
  const { logInterval, location, sensorLogs } = sensor;
  console.log('create');

  console.log(parsedLogs);
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
    .map(({ temperature }, i) => ({
      id: generateUUID(),
      temperature,
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
