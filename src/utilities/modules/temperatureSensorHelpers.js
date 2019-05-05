/* eslint-disable no-continue */
import { generateUUID } from 'react-native-database';
import { NativeModules } from 'react-native';

const fullInt = 256 * 256;
const halfInt = fullInt / 2;
const millisecondInMinute = 60 * 1000;
const preAggregateInterval = 20 * millisecondInMinute;
const fullAggregateInterval = 12 * 60 * millisecondInMinute;
const resetLogInterval = 60 * 4; // Set sensor to 4 minute intervals

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
    sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, '');
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
      while (curLog.timestamp > new Date(endTimeStamp + preAggregateInterval)) {
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

function doFullAggregation({ result, sensor, database }) {
  const { sensorLogs } = sensor;

  let lastFullAggregation = null;
  let aggregateFrom = sensorLogs
    .filtered('aggregation == "aggregate" || aggregation == "breachAggregate"')
    .max('timestamp');
  const allPreAggregateLogs = sensorLogs.filtered('aggregation == "preAggregate"');

  if (!aggregateFrom) aggregateFrom = allPreAggregateLogs.min('timestamp');
  else {
    lastFullAggregation = aggregateFrom;
    aggregateFrom = new Date(aggregateFrom.getTime() + 1);
  }

  if (!aggregateFrom) {
    return { ...result, noRecordsToFullAggregate: true };
  }

  const allPreAggregateMaxDate = allPreAggregateLogs.max('timestamp');
  const logsToAdd = [];

  const halfFullAggregateInterval = Math.floor(fullAggregateInterval / 2);
  let aggregateTo = new Date(aggregateFrom.getTime() + fullAggregateInterval);
  let aggregateMiddlePoint = new Date(aggregateFrom.getTime() + halfFullAggregateInterval);
  let lastAggregationTo = null;

  while (allPreAggregateMaxDate >= aggregateTo) {
    const thisPeriodLogs = allPreAggregateLogs.filtered(
      'timestamp >= $0 && timestamp < $1',
      aggregateFrom,
      aggregateTo
    );

    logsToAdd.push({
      id: generateUUID(),
      location: sensor.location,
      sensor,
      temperature: thisPeriodLogs.max('temperature'),
      timestamp: aggregateMiddlePoint,
      aggregation: 'aggregate',
    });

    logsToAdd.push({
      id: generateUUID(),
      location: sensor.location,
      sensor,
      temperature: thisPeriodLogs.min('temperature'),
      timestamp: aggregateMiddlePoint,
      aggregation: 'aggregate',
    });

    lastAggregationTo = aggregateTo;
    aggregateFrom = aggregateTo;
    aggregateTo = new Date(aggregateFrom.getTime() + fullAggregateInterval);
    aggregateMiddlePoint = new Date(aggregateFrom.getTime() + halfFullAggregateInterval);
  }
  if (lastAggregationTo == null) {
    if (lastFullAggregation !== null) lastAggregationTo = lastFullAggregation;
    else lastAggregationTo = new Date(2019, 1, 1);
  }

  const logsToDelete = sensorLogs
    .filtered('aggregation == "preAggregate" && timestamp < $0', lastAggregationTo)
    .slice();
  const fullAggregationDeletions = logsToDelete.length;
  database.write(() => {
    logsToDelete.forEach(sensorLog => {
      database.delete('SensorLog', sensorLog);
    });
  });

  database.write(() => {
    logsToAdd.forEach(sensorLog => {
      const newSensorLog = database.update('SensorLog', sensorLog);
      sensor.sensorLogs.push(newSensorLog);
      linkToBatches(newSensorLog, database);
    });
  });

  return { ...result, fullAggregateAdditions: logsToAdd.length, fullAggregationDeletions };
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
  const downloadedData = await NativeModules.bleTempoDisc.getUARTCommandResults(
    macAddress,
    `*logall`
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
    const sensors = await NativeModules.bleTempoDisc.getDevices(51, 20000, macAddress);
    const foundSensors = Object.entries(sensors).length > 0;
    if (foundSensors) {
      updateSensors(sensors, database);
      const result = await downloadAndIntegrateLogs({ sensor, database });
      // Reset log interval (resets sensor)

      return {
        ...result,
        resetResult: await NativeModules.bleTempoDisc.getUARTCommandResults(
          macAddress,
          `*lint${resetLogInterval}`
        ),
      };
    }
    return { failStep: 'looking for sensor' };
  } catch (e) {
    return { failStep: 'syncing sensor', e };
  }
}
