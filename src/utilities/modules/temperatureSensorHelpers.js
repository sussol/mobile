/* eslint-disable no-console */
/* eslint-disable no-continue */
import { generateUUID } from 'react-native-database';
import { NativeModules } from 'react-native';

const ONE_MINUTE_MILLISECONDS = 1000 * 60;
const ONE_HOUR_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 60;
const TWO_HOURS_MILLISECONDS = ONE_HOUR_MILLISECONDS * 2;
const EIGHT_HOURS_MILLISECONDS = ONE_HOUR_MILLISECONDS * 8;
const FIVE_MINUTES_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 5;
// Include a small offset on the interval to account for each timestamp being
// small amounts of time off.
const FULL_AGGREGATION_INTERVAL = EIGHT_HOURS_MILLISECONDS + FIVE_MINUTES_MILLISECONDS;
const fullInt = 256 * 256;
const halfInt = fullInt / 2;
const millisecondInMinute = 60 * 1000;
const preAggregateInterval = 20 * millisecondInMinute;
const sensorLogInterval = 60 * 4;
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

function parseSensorAdvertisment(advertismentData) {
  return {
    batteryLevel: advertismentData[8],
    temperature: toInt(advertismentData, 13) / 10.0,
    logInterval: toInt(advertismentData, 9),
    numberOfLogs: toInt(advertismentData, 11),
    lastConnectionTimestamp: new Date(),
  };
}

export function getFormatedPeriod(difference) {
  const seconds = difference / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  if (days > 1) return `${days.toFixed(0)} day/s`;
  if (hours > 1) return `${hours.toFixed(0)} hour/s`;
  if (minutes > 1) return `${minutes.toFixed(0)} minute/s`;
  if (seconds > 1) return `${seconds.toFixed(0)} second/s`;
  return 'now';
}

export function parseDownloadedData(downloadedData) {
  if (downloadedData.rawResultLines.length === 0) {
    return {
      failedParsing: true,
    };
  }
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
  return {
    failedParsing: true,
  };
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
    sensors = await NativeModules.bleTempoDisc.getDevices(manufacturerID, sensorScanTimeout, '');
    console.log('recevied results ', sensors);
  } catch (e) {
    console.log('rejected ', e.code, e.message);
  }
  updateSensors(sensors, database);
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

function preAggregateLogs({ result, sensor, database }) {
  let logsToDelete = [];
  const logsToAdd = [];
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

  return {
    ...result,
    preAggregationlogsToDeleteLength: logsToDelete.length,
    preAggregationlogsToAddLength: logsToAdd.length,
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

function applyBreaches({ result, sensor, database }) {
  if (!sensor.location) return result;

  const minTemperature = 2;
  const maxTemperature = 8;

  const breachDescribers = [
    {
      fromTemperature: -Infinity,
      toTemperature: 2,
      duration: 15,
    },
    {
      fromTemperature: 8,
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

  const breachedLogs = [];
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
    if (currentLog.aggregation === 'breachAggregate') {
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

  return { ...result, numberOfNewLogsInBreach: breachedLogs.length };
}

function addHeadAndTrailingLogToBreach({ result, sensor, database }) {
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

  return { ...result, numberOfBreachHedOrTailLogs: headOrTrailLogs.length };
}

function createGenericSensorLog({
  sensor,
  location,
  temperature,
  isInBreach = false,
  aggregation = 'aggregate',
  itemBatches,
}) {
  return {
    id: generateUUID(),
    sensor,
    location,
    temperature,
    isInBreach,
    aggregation,
    itemBatches,
  };
}

/**
 *
 * @param {Array} SensorLogGroup
 */
function createFullAggregateSensorLogs(sensorLogGroup) {
  const meanSensorLog = sensorLogGroup[Math.floor(sensorLogGroup.length / 2)];
  return [
    createGenericSensorLog({
      ...meanSensorLog,
      aggregation: 'aggregate',
      temperature: Math.max(...sensorLogGroup.map(({ max }) => max)),
    }),
    createGenericSensorLog({
      ...meanSensorLog,
      temperature: Math.min(...sensorLogGroup.map(({ min }) => min)),
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
function doFullAggregation({ result, sensor, database }) {
  const { sensorLogs } = sensor;
  if (!sensorLogs || sensorLogs.length === 0) return null;
  // Want to leave the last 2 hours of logs un-aggregated. Filter them
  // out.
  const maxTimeToAggregate =
    sensorLogs.filtered('aggregate == $0', 'preAggregate').max('timestamp') -
    TWO_HOURS_MILLISECONDS;
  const sortedSensorLogs = sensorLogs
    .filtered('aggregate == $0 && timestamp < $1', 'preAggregate', maxTimeToAggregate)
    .sorted('timestamp');
  // Initialized for creating a timestamp of the first sensor log for
  // a sequential group of logs, which are delimited by a sensorlog
  // outside of the 8 hour window this group is aggregated for.
  let logGroupStartTimestamp = null;
  // 2D array for all groups of to-be-aggregated sensor logs.
  const sensorLogGroups = [];
  // A collection of sensor logs, grouped for the currently being operated on,
  // < 8 hour period.
  let sensorLogGroup = [];
  sortedSensorLogs.forEach(sensorLog => {
    const { timestamp } = sensorLog;
    // Premature return if this sensorlog is malformed
    if (!timestamp) return;
    // Check if this sensorLog is in the current interval.
    const isInSameInterval = logGroupStartTimestamp - timestamp < FULL_AGGREGATION_INTERVAL;
    // If so, simply add it to the current group of logs.
    if (isInSameInterval) sensorLogGroup.push(sensorLog);
    // Otherwise, hit a delimiter. If there are already logs in the current
    // sensor log group, this is an ending delimiter, store the group and reset.
    else if (sensorLogGroup.length !== 0) sensorLogGroups.push([...sensorLogGroup]);
    // Resetting for a new group of sensor logs;
    if (!isInSameInterval) {
      sensorLogGroup = [sensorLog];
      logGroupStartTimestamp = timestamp;
    }
  });
  // Create an array of aggregated sensor log objects
  const aggregatedSensorLogs = sensorLogGroups
    .map(group => createFullAggregateSensorLogs(group))
    .flat();
  // Store each aggregated sensorlog in the database.
  database.write(() => {
    aggregatedSensorLogs.forEach(aggregatedLog => database.update('SensorLog', aggregatedLog));
    // Delete each pre-aggregated sensorlog.
    sortedSensorLogs.forEach(preAggregatedLog => database.delete(preAggregatedLog));
  });
  return {
    ...result,
    fullAggregateAdditions: aggregatedSensorLogs.length,
    preAggregateDeletions: sortedSensorLogs.length,
  };
}

function doAllSenosorAggregations({ result: resultParameter, sensor, database }) {
  // aggregation
  // eslint-disable-next-line no-unused-vars
  let result = resultParameter;
  result = preAggregateLogs({ result, sensor, database });
  result = applyBreaches({ result, sensor, database });
  result = addHeadAndTrailingLogToBreach({ result, sensor, database });
  result = doFullAggregation({ result, sensor, database });

  return result;
  // the aggregation
}

async function downloadAndIntegrateLogs({ database, sensor }) {
  const { macAddress } = sensor;
  console.log('sending log all');
  const downloadedData = await NativeModules.bleTempoDisc.getUARTCommandResults(
    macAddress,
    `*logall`,
    450, // connection delay
    11 // number of reconnects
  );
  const parsedLogs = parseDownloadedData(downloadedData).temperatureReadings;
  if (parsedLogs.length > 0) {
    const result = integrateLogs(parsedLogs, sensor, database);

    return doAllSenosorAggregations({ result, sensor, database });
    // resetSensor
  }
  return { failStep: 'downloading logs' };
}

export async function syncSensor(sensor, database) {
  const { macAddress } = sensor;

  try {
    const sensors = await NativeModules.bleTempoDisc.getDevices(
      manufacturerID,
      sensorScanTimeout,
      macAddress
    );
    const foundSensors = Object.entries(sensors).length > 0;
    if (foundSensors) {
      updateSensors(sensors, database);
      const result = await downloadAndIntegrateLogs({ sensor, database });
      // Reset log interval (resets sensor)

      const resetResult = await NativeModules.bleTempoDisc.getUARTCommandResults(
        macAddress,
        `*lint${sensorLogInterval}`, // this also resets sensor logs
        450, // connection delay
        11 // number of reconnects
      );

      const adjustFrequencyResult = await NativeModules.bleTempoDisc.getUARTCommandResults(
        macAddress,
        `*sadv1000`, // adjust frequencey, for more chances of sync next time
        450, // connection delay
        11 // number of reconnects
      );

      return {
        ...result,
        resetResult,
        adjustFrequencyResult,
      };
    }
    return { failStep: 'looking for sensor' };
  } catch (e) {
    return { failStep: 'syncing sensor', e };
  }
}
