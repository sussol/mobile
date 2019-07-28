import { generateUUID } from 'react-native-database';

/**
 * Utility methods for the Vaccine module.
 */

const SENSOR_LOG_FULL_AGGREGATE_TYPE = 'aggregate';

/**
 * Creates generic JS objects representing a sensor log
 */
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
 * Creates two generic sensor log objects representing a full aggregation,
 * from a group of sensor logs. One created for both the minimum temperature
 * during the period of the sensor logs and another for hte maximum temperature.
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

/**
 * Takes a sensor log and links all item batches which are currently
 * in that location. Only used once a sensor log has been flagged as
 * a breach or after a full aggregation as to limit the number of
 * SensorLogItemBatchJoin records.
 */
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

/**
 * Creates realm SensorLog objects from logs downloaded from a physical
 * sensor.
 *
 * Logs downloaded from a sensor have no timestamp. To ensure the correct
 * number of logs are created, compare the most recent logs timestamp, with
 * the difference between the sensors log interval * the number of logs
 * and the current date. If the latest log timestamp is larger, adjust the
 * number of logs and starting date for logs that should be created.
 */
export function createSensorLogs({ parsedLogs, sensor, database }) {
  const { logInterval, location, sensorLogs } = sensor;
  // Log interval is in seconds, working with milliseconds in this function.
  const logIntervalMillisecods = logInterval * 1000;
  const currentDateMilliseconds = new Date().getTime();

  // Find the number of logs to be created.
  let lookBackNumberOfLogs = parsedLogs.length;
  let firstLogTimestamp = currentDateMilliseconds - logIntervalMillisecods * lookBackNumberOfLogs;

  // If there are sensor logs, check if the starting timestamp and number of logs
  // being created need to be adjusted.
  if (sensorLogs.length > 0) {
    const latestLogTimestamp = sensorLogs.max('timestamp');
    if (latestLogTimestamp > firstLogTimestamp) {
      const millisecondsSinceLastLog = currentDateMilliseconds - latestLogTimestamp;
      // Account for the length of the array
      lookBackNumberOfLogs = Math.floor(millisecondsSinceLastLog / logIntervalMillisecods - 1);
      firstLogTimestamp = currentDateMilliseconds - lookBackNumberOfLogs * logIntervalMillisecods;
    }
  }

  // Create generic sensor log objects for each log to create
  const startingLogIndex = parsedLogs.length - lookBackNumberOfLogs;
  const logsToIntegrate = parsedLogs
    .slice(startingLogIndex, parsedLogs.length)
    .map(({ temperature }, index) => {
      const timestamp = new Date(firstLogTimestamp + logIntervalMillisecods * index);
      return createGenericSensorLog({ timestamp, temperature, sensor, location });
    });

  // Enter each log into the database
  database.write(() => {
    logsToIntegrate.forEach(sensorLog => {
      const sLog = database.update('SensorLog', sensorLog);
      sensor.sensorLogs.push(sLog);
    });
  });

  return { success: true, data: { numberOfLogsCreated: logsToIntegrate.length } };
}

export function genericErrorReturn(e) {
  let failData = e;

  if (!e.code) {
    failData = { code: 'unexpected', description: 'unexpected error', e };
  }
  return { success: false, failData };
}
