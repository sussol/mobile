/* eslint-disable no-throw-literal */
/* eslint-disable no-console */
/* eslint-disable no-continue */
import { generateUUID } from 'react-native-database';
import { NativeModules } from 'react-native';

const SENSOR_LOG_PRE_AGGREGATE_TYPE = 'preAggregate';
const SENSOR_LOG_FULL_AGGREGATE_TYPE = 'aggregate';
const SENSOR_LOG_BREACH_AGGREGATE_TYPE = 'breachAggregate';

const SENSOR_SYNC_COMMAND_GET_LOGS = '*logall';
const SENOSOR_SYNC_COMMAND_RESET_INTERVAL = '*lint240'; // 4 minutes
const SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL = '*sadv1000';
const SENSOR_SYNC_CONNECTION_DELAY = 450;
const SENSOR_SYNC_NUMBER_OF_RECONNECTS = 11;

const ONE_MINUTE_MILLISECONDS = 1000 * 60;
const ONE_HOUR_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 60;
const EIGHT_HOURS_MILLISECONDS = ONE_HOUR_MILLISECONDS * 8;
const FIVE_MINUTES_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 5;
const NO_FULL_AGGREGATE_PERIOD = EIGHT_HOURS_MILLISECONDS * 4 + FIVE_MINUTES_MILLISECONDS;
// Include a small offset on the interval to account for each timestamp being
// small amounts of time off.
const FULL_AGGREGATION_INTERVAL = EIGHT_HOURS_MILLISECONDS + FIVE_MINUTES_MILLISECONDS;
const fullInt = 256 * 256;
const halfInt = fullInt / 2;
const millisecondInMinute = 60 * 1000;
const preAggregateInterval = 20 * millisecondInMinute;
const manufacturerID = 307;
const sensorScanTimeout = 10000;

function toUInt(byteArray, startPosition) {
  // TO DO negative temperatures (this is unsigned int conversion)
  return byteArray[startPosition] * 256 + byteArray[startPosition + 1];
}

function toInt(byteArray, startPosition) {
  const uINT = toUInt(byteArray, startPosition);
  if (uINT > halfInt) {
    return (fullInt - uINT) * -1;
  }
  return uINT;
}

function addRefreshSensor(sensorInfo, sensorData, database) {
  const sensors = database.objects('Sensor').filtered('macAddress == $0', sensorInfo.macAddress);
  database.write(() => {
    let id = generateUUID();
    // eslint-disable-next-line prefer-destructuring
    if (sensors.length > 0) id = sensors[0].id;
    database.update('Sensor', {
      id,
      ...sensorInfo,
      ...sensorData,
    });
  });
}

function genericErrorReturn(e) {
  let failData = e;

  if (!e.code) {
    failData = { code: 'unexpected', description: 'unexpected error', e };
  }
  return { success: false, failData };
}

function parseSensorAdvertisment(advertismentData) {
  return {
    batteryLevel: advertismentData[8],
    temperature: toInt(advertismentData, 13) / 10.0,
    logInterval: toInt(advertismentData, 9),
    numberOfLogs: toInt(advertismentData, 11),
    lastConnectionTimestamp: new Date(),
  };
}

// TODO either delete or maybe can use in 'breach duration' output
// export function getFormatedPeriod(difference) {
//   const seconds = difference / 1000;
//   const minutes = seconds / 60;
//   const hours = minutes / 60;
//   const days = hours / 24;
//   if (days > 1) return `${days.toFixed(0)} day/s`;
//   if (hours > 1) return `${hours.toFixed(0)} hour/s`;
//   if (minutes > 1) return `${minutes.toFixed(0)} minute/s`;
//   if (seconds > 1) return `${seconds.toFixed(0)} second/s`;
//   return 'now';
// }

export function parseDownloadedData(downloadedData) {
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

export function updateSensors(sensors, database) {
  Object.entries(sensors).forEach(([address, { name, advertismentData }]) => {
    const sensorData = parseSensorAdvertisment(advertismentData);
    addRefreshSensor({ macAddress: address, name }, sensorData, database);
  });
}

export async function refreshAndUpdateSensors(runWithLoadingIndicator, database) {
  let sensors = [];
  try {
    sensors = await NativeModules.BleTempoDisc.getDevices(manufacturerID, sensorScanTimeout, '');
    updateSensors(sensors, database);
  } catch (e) {
    // TO DO warn user or bugsnag for error
  }
}

function integrateLogs(parsedLogs, sensor, database) {
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

export function preAggregateLogs({ sensor, database }) {
  let logsToDelete = [];
  const logsToAdd = [];
  try {
    const sortedLogs = sensor.sensorLogs
      .filtered('aggregation == null || aggregation == ""')
      .sorted('timestamp');

    let timeStamp = sortedLogs[0].timestamp;
    let endTimeStamp = new Date(timeStamp.getTime() + preAggregateInterval);
    let minLog = sortedLogs[0];
    let logsToDeleteTemp = [];

    for (let i = 0; i < sortedLogs.length; i += 1) {
      const curLog = sortedLogs[i];
      if (curLog.timestamp > endTimeStamp) {
        // For logs that were previously higher then preAggregateInterval
        while (curLog.timestamp > new Date(endTimeStamp.getTime() + preAggregateInterval)) {
          timeStamp = endTimeStamp;
          endTimeStamp = new Date(endTimeStamp.getTime() + preAggregateInterval);
        }
        logsToDelete = [...logsToDelete, ...logsToDeleteTemp];
        logsToDeleteTemp = [curLog];
        logsToAdd.push({
          id: generateUUID(),
          location: sensor.location,
          sensor,
          temperature: minLog.temperature,
          timestamp: endTimeStamp,
          aggregation: 'preAggregate',
        });
        minLog = curLog;
        timeStamp = endTimeStamp;
        endTimeStamp = new Date(endTimeStamp.getTime() + preAggregateInterval);
      } else {
        logsToDeleteTemp.push(curLog);
        if (minLog.temperature > curLog.temperature) minLog = curLog;
      }
    }

    database.write(() => {
      logsToDelete.forEach(sensorLog => {
        database.delete('SensorLog', sensorLog);
      });
    });

    database.write(() => {
      logsToAdd.forEach(sensorLog => {
        const newSensorLog = database.update('SensorLog', sensorLog);
        sensor.sensorLogs.push(newSensorLog);
      });
    });
  } catch (e) {
    return genericErrorReturn(e);
  }
  return {
    success: true,
    data: {
      preAggregationlogsToDeleteLength: logsToDelete.length,
      preAggregationlogsToAddLength: logsToAdd.length,
    },
  };
}

function linkToBatches(sensorLog, database) {
  const batchesToLink = database
    .objects('ItemBatch')
    .filtered('location.id = $0 && numberOfPacks > 0', sensorLog.location.id);

  batchesToLink.forEach(itemBatch => {
    itemBatch.sensorLogs.push(sensorLog);
    sensorLog.itemBatches.push(itemBatch);
    database.update('SensorLogItemBatchJoin', {
      id: generateUUID(),
      sensorLog,
      itemBatch,
    });
  });
}

export function applyBreaches({ sensor, database }) {
  const breachedLogs = [];
  try {
    const minTemperature = 16;
    const maxTemperature = 20;

    const breachDescribers = [
      {
        fromTemperature: -Infinity,
        toTemperature: 16,
        duration: 15,
      },
      {
        fromTemperature: 20,
        toTemperature: Infinity,
        duration: 60,
      },
    ];

    const isBeyondThreshold = sensorLog =>
      minTemperature > sensorLog.temperature || sensorLog.temperature > maxTemperature;

    const areLogsInBreach = sensorLogs => {
      const last = sensorLogs.length - 1;

      const { temperature } = sensorLogs[0];
      let duration = sensorLogs[last].timestamp.getTime() - sensorLogs[0].timestamp.getTime();
      duration /= millisecondInMinute;

      return breachDescribers.some(
        ({ fromTemperature, toTemperature, duration: thresholdDuration }) =>
          fromTemperature <= temperature &&
          toTemperature >= temperature &&
          duration >= thresholdDuration
      );
    };

    const addBreachLog = ({ id }) => {
      breachedLogs.push(id);
    };

    let firstAggregate = sensor.sensorLogs.filtered('aggregation == "aggregate"').max('timestamp');
    if (!firstAggregate) firstAggregate = new Date(2019, 1, 1);
    const sensorLogs = sensor.sensorLogs
      .filtered(
        '(aggregation == "preAggregate" || aggregation == "breachAggregate") && timestamp > $0',
        firstAggregate
      )
      .sorted('timestamp')
      .slice();

    let isInBreach = false;

    let possibleBreachLogs = [];
    // Add breaches
    for (let i = 0; i < sensorLogs.length; i += 1) {
      const currentLog = sensorLogs[i];
      const isLogBeyondThreshold = isBeyondThreshold(currentLog);
      if (currentLog.aggregation === SENSOR_LOG_BREACH_AGGREGATE_TYPE) {
        // eslint-disable-next-line prefer-destructuring
        isInBreach = currentLog.isInBreach;
        continue;
      }

      if (isInBreach && isLogBeyondThreshold) {
        addBreachLog(currentLog);
        continue;
      } else if (isInBreach && !isLogBeyondThreshold) {
        isInBreach = false;
        continue;
      }

      if (isLogBeyondThreshold) {
        possibleBreachLogs.push(currentLog);
        if (possibleBreachLogs.length > 1 && areLogsInBreach(possibleBreachLogs)) {
          isInBreach = true;
          possibleBreachLogs.forEach(breachedLog => addBreachLog(breachedLog));
          possibleBreachLogs = [];
        }
      } else {
        possibleBreachLogs = [];
      }
    }

    database.write(() => {
      breachedLogs.forEach(id => {
        const sensorLog = database.update('SensorLog', {
          id,
          aggregation: 'breachAggregate',
          isInBreach: true,
        });

        linkToBatches(sensorLog, database);
      });
    });
  } catch (e) {
    return genericErrorReturn(e);
  }

  return { success: true, data: { numberOfNewLogsInBreach: breachedLogs.length } };
}

export function addHeadAndTrailingLogToBreach({ sensor, database }) {
  try {
    const headOrTrailLogs = [];
    const addHeadOrTrailLog = ({ id }) => {
      headOrTrailLogs.push(id);
    };

    let firstAggregate = sensor.sensorLogs.filtered('aggregation == "aggregate"').max('timestamp');
    if (!firstAggregate) firstAggregate = new Date(2019, 1, 1);

    const sensorLogs = sensor.sensorLogs
      .filtered(
        '(aggregation == "preAggregate" || aggregation == "breachAggregate") && timestamp > $0',
        firstAggregate
      )
      .sorted('timestamp')
      .slice();

    for (let i = 0; i < sensorLogs.length; i += 1) {
      const currentLog = sensorLogs[i];
      if (currentLog.aggregation !== 'preAggregate') continue;
      if (sensorLogs.length === 1) continue;
      if (
        (i !== 0 && sensorLogs[i - 1].isInBreach) ||
        (i !== sensorLogs.length - 1 && sensorLogs[i + 1].isInBreach)
      ) {
        addHeadOrTrailLog(currentLog);
      }
    }

    database.write(() => {
      headOrTrailLogs.forEach(id => {
        const sensorLog = database.update('SensorLog', {
          id,
          aggregation: 'breachAggregate',
        });
        linkToBatches(sensorLog, database);
      });
    });

    return {
      success: true,
      data: {
        numberOfBreachHedOrTailLogs: headOrTrailLogs.length,
      },
    };
  } catch (e) {
    return genericErrorReturn(e);
  }
}

function linkSensorLogToItemBatches({ sensorLog, database }) {
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
function createFullAggregateSensorLogs(sensorLogGroup) {
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
 * Utility method used to aggregate pre-aggregate sensor logs for a given
 * sensor.
 *
 * Pre-aggregate sensor logs: sensor log for a 20 minute time interval.
 * Aggregate sensor log: aggregated sensor log for a 8 hour interval.
 *
 * Takes groups of pre-aggregate sensor logs and creates two new
 * sensor logs for each group - each having a temperature equal
 * to the max and min temperature within the group of sensor logs.
 * The timestamp is equal to the median timestamp of all sensor
 * logs within the group.
 *
 * Each group to be aggregated is a collection of sequential sensor logs which fit
 * within an 8 hour interval beginning with the first sensor logs timestamp. Each
 * pre-aggregate sensor log is for a 20 minute interval, so there will be a
 * maximum of 24 sensor logs for each full aggregate log.
 * If within the 8 hour period a breach occurred, there will be less sensorlogs,
 * to a minimum of 1.
 * @param {object}       result   object containing the result of aggregation
 * @param {Realm.Sensor} sensor   The Sensor object for which the logs should be aggregated
 * @param {Realm}        database App-wide database entry point
 */
export function doFullAggregation({ sensor, database }) {
  const { sensorLogs } = sensor;
  if (!sensorLogs || sensorLogs.length === 0) {
    return { success: true, data: { fullAggregateAdditions: 0, preAggregateDeletions: 0 } };
  }
  try {
    // Want to leave at least the last 32 hours unaggregated. Also want to only
    // aggregate the most recently added preAggregate logs, from the most
    // most recent fullAggregation log.
    const mostRecentFullAggregateTimestamp = sensorLogs
      .filtered('aggregation == $0', SENSOR_LOG_FULL_AGGREGATE_TYPE)
      .max('timestamp');
    const mostRecentPreAggregateTimestamp = sensorLogs
      .filtered('aggregation == $0', SENSOR_LOG_PRE_AGGREGATE_TYPE)
      .max('timestamp');
    // Starting timestamp is either from the first fullAggregate timestamp, or beginning of time
    const aggregationIntervalStart = mostRecentFullAggregateTimestamp || new Date(2001, 1, 1);
    // Ending timestamp is either from the most recent preAggregate or from now, less the
    // no full aggregate period (32 hours)
    const aggregationIntervalEnd = new Date(
      (mostRecentPreAggregateTimestamp || new Date()).getTime() - NO_FULL_AGGREGATE_PERIOD
    );
    // Query for all sensorLogs which are preAggregates, between the above two
    // timestamps
    const sortedSensorLogs = sensorLogs
      .filtered(
        'aggregation == $0  && timestamp > $1 && timestamp < $2',
        SENSOR_LOG_PRE_AGGREGATE_TYPE,
        aggregationIntervalStart,
        aggregationIntervalEnd
      )
      .sorted('timestamp');

    // Will hold the timestamp of a sequential group of preAggregate logs
    // which are to-be aggregated into a fullAggregate.
    let logGroupStartTimestamp = -Infinity;
    // sensorLogGroups is a 2D array for all groups of to-be-aggregated sensor logs.
    // sensorLogGroup is A collection of sensor logs which will be aggregated into a
    // full aggregated sensorLog - 1D arrays housed within the 2D array.
    const sensorLogGroups = [];
    let sensorLogGroup = [];
    // Find sets of sensorLogs within the full aggregation interval. Delimited by
    // a sensorLog which is not within the same interval.
    sortedSensorLogs.forEach(sensorLog => {
      const { timestamp } = sensorLog;
      // Premature return if this sensorlog is malformed
      if (!timestamp) return;
      // Check if this sensorLog is in the current interval. The first iteration
      // will never be in the same interval, as one hasn't been created/started.
      const isInSameInterval = timestamp - logGroupStartTimestamp < FULL_AGGREGATION_INTERVAL;
      // If so, add it to the current group of logs.
      if (isInSameInterval) sensorLogGroup.push(sensorLog);
      // Otherwise, hit a delimiter. If there are already logs in the current
      // sensor log group, this is an ending delimiter, store the group and reset.
      else if (sensorLogGroup.length !== 0) sensorLogGroups.push([...sensorLogGroup]);
      // Resetting for a new group of sensor log. This is called on the first iteration
      // to initialize the first group. The last group of sensorLogs will not be set aside
      // for aggregation unless it is also delimited by a sensorLog not within that group.
      if (!isInSameInterval) {
        sensorLogGroup = [sensorLog];
        logGroupStartTimestamp = timestamp;
      }
    });
    // Create an array of aggregated sensor log objects
    let aggregatedSensorLogs = [];
    sensorLogGroups.forEach(group => {
      aggregatedSensorLogs = [...aggregatedSensorLogs, ...createFullAggregateSensorLogs(group)];
    });
    const deleteFromTimestamp = new Date(
      sensorLogGroup.length > 0 ? sensorLogGroup[0].timestamp : aggregationIntervalEnd
    );
    const sensorLogsToDelete = sortedSensorLogs.filtered('timestamp < $0', deleteFromTimestamp);
    const preAggregateDeletions = sensorLogsToDelete.length;
    // Store each aggregated sensorlog in the database and link the item batches
    // currently in the same location. Also create a sensorLogItemBatchJoin record.
    database.write(() => {
      aggregatedSensorLogs.forEach(aggregatedLog => {
        const sensorLog = database.update('SensorLog', aggregatedLog);
        sensor.sensorLogs.push(sensorLog);
        linkSensorLogToItemBatches({ sensorLog, database });
      });
      // Delete each pre-aggregated sensorlog prior to the 'no deletion interval'.
      // Somewhat arbitrary three days to ensure there is always enough data and
      // a little bit defensive in case something goes wrong.
      database.delete('SensorLog', sensorLogsToDelete);
    });

    return {
      success: true,
      data: {
        fullAggregateAdditions: aggregatedSensorLogs.length,
        preAggregateDeletions,
      },
    };
  } catch (e) {
    return genericErrorReturn(e);
  }
}

export async function syncSensorLogs({
  database,
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  const { macAddress } = sensor;
  try {
    const downloadedData = await NativeModules.BleTempoDisc.getUARTCommandResults(
      macAddress,
      SENSOR_SYNC_COMMAND_GET_LOGS,
      connectionDelay,
      numberOfReconnects
    );

    if (!downloadedData || !downloadedData.success) {
      throw { code: 'syncdata', description: 'failed to sync data from sensor' };
    }
    const parsedLogsReturn = parseDownloadedData(downloadedData);
    return {
      success: true,
      data: {
        ...integrateLogs(parsedLogsReturn.temperatureReadings, sensor, database),
        totalNumberOfSyncedLogs: parsedLogsReturn.totalNumberOfRecords,
      },
    };
  } catch (e) {
    return genericErrorReturn(e);
  }
}

export async function findAndUpdateSensor({ sensor, database }) {
  const { macAddress } = sensor;
  try {
    const sensors = await NativeModules.BleTempoDisc.getDevices(
      manufacturerID,
      sensorScanTimeout,
      macAddress
    );
    const foundSensor = Object.entries(sensors).length > 0;
    if (foundSensor) updateSensors(sensors, database);
    else throw { code: 'notfound', description: 'sensor not found' };
  } catch (e) {
    return genericErrorReturn(e);
  }
  return {
    success: true,
  };
}

export async function executeSensorUARTCommand({
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
  command,
}) {
  const { macAddress } = sensor;
  let uartResult = null;

  try {
    uartResult = await NativeModules.BleTempoDisc.getUARTCommandResults(
      macAddress,
      command, // this also resets sensor logs
      connectionDelay, // connection delay
      numberOfReconnects // number of reconnects
    );

    if (!uartResult || !uartResult.success) {
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

  return { success: true, data: uartResult };
}

export async function resetSensorInterval({
  sensor,
  connectionDelay = SENSOR_SYNC_CONNECTION_DELAY,
  numberOfReconnects = SENSOR_SYNC_NUMBER_OF_RECONNECTS,
}) {
  return executeSensorUARTCommand({
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
  return executeSensorUARTCommand({
    sensor,
    connectionDelay,
    numberOfReconnects,
    command: SENSOR_SYNC_COMMAND_RESET_ADVERTISEMENT_INTERVAL,
  });
}
