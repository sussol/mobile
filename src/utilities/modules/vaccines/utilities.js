/* eslint-disable prefer-destructuring */
import { generateUUID } from 'react-native-database';
import { createRecord } from '../../../database';

/**
 * Utility methods for the Vaccine module.
 */

const FULL_AGGREGATE_TYPE = 'aggregate';
const PREAGGREGATE_TYPE = 'preAggregate';
const SENSOR_LOG_BREACH_AGGREGATE_TYPE = 'breachAggregate';
const ONE_MINUTE_MILLISECONDS = 1000 * 60;
/**
 * Creates generic JS objects representing a sensor log
 */
export function createGenericSensorLog({
  sensor,
  location,
  temperature,
  isInBreach = false,
  aggregation = '',
  itemBatches = [],
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
      aggregation: FULL_AGGREGATE_TYPE,
      temperature: Math.max(...temperatures),
    }),
    createGenericSensorLog({
      ...medianSensorLog,
      aggregation: FULL_AGGREGATE_TYPE,
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

export function createBreach({ breach, database, locationType }) {
  const { head, tail, breachLogs } = breach;
  const { minTemperature, maxTemperature } = locationType;
  // Using the breachlogs, not including delimiters to determine breach duration
  const firstBreachLog = breachLogs[0];
  const lastBreachLog = breachLogs[breachLogs.length - 1];
  const { timestamp: firstTimestamp, temperature } = firstBreachLog;
  const { timestamp: lastTimestamp } = lastBreachLog;
  const startingTime = firstTimestamp.getTime();
  const endingTime = lastTimestamp.getTime();
  const duration = (endingTime - startingTime) / ONE_MINUTE_MILLISECONDS;
  // Breach descriptors for a min or max breach, including the duration required.
  const breachDescriptors = [
    {
      minThreshold: -Infinity,
      maxThreshold: minTemperature,
      thresholdDuration: 15,
    },
    {
      minThreshold: maxTemperature,
      maxThreshold: Infinity,
      thresholdDuration: 60,
    },
  ];

  // If either conditions are met, a breach is found.
  const isInBreach = breachDescriptors.some(
    ({ minThreshold, maxThreshold, thresholdDuration }) =>
      minThreshold <= temperature && maxThreshold >= temperature && duration >= thresholdDuration
  );

  // Inner function for updating a sensorlog to a breach log.
  const setBreach = (sensorLog, delimiter = true) => {
    database.update('SensorLog', {
      ...sensorLog,
      aggregation: SENSOR_LOG_BREACH_AGGREGATE_TYPE,
      isInBreach: delimiter,
    });
    linkSensorLogToItemBatches({ sensorLog, database });
  };

  // If in a breach, set all breach logs to breach aggregation with
  // isInBreach = true, and the delimiter logs, if any, to breach
  // aggregate with isInBreach = false
  if (isInBreach) {
    breachLogs.forEach(log => {
      database.write(() => setBreach(log));
    });
    database.write(() => {
      if (head) setBreach(head, false);
      if (tail) setBreach(tail, false);
    });
  }
  return isInBreach;
}

/**
 * Helper method to find an ongoing breach, if there is on.
 * Uses the most recent delimiter log (with isInBreach = true,
 * but without the breachAggregate aggregation type) timestamp
 * to find all sensor logs after that point. If the most recent
 * log after the delimiter log is a breachAggregate, then it is
 * a head log, otherwise it is a tail log and there is no ongoing
 * breach. If there is no delimiter logs, then the logs have always
 * been in an ongoing breach.
 */
const getOngoingBreach = ({ database, sensor }) => {
  const { location } = sensor;
  if (!location) return [];
  // Fetch all the sensor logs in the sensors location.
  const sensorLogs = database
    .objects('SensorLog')
    .filtered('location.id = $0', location.id)
    .sorted('timestamp');
  // Find either the most recent delimiter timestamp, or the start of time.
  const latestDelimiterTimestamp =
    sensorLogs
      .filtered('isInBreach == $0 && aggregation == $1', false, SENSOR_LOG_BREACH_AGGREGATE_TYPE)
      .max('timestamp') || new Date(null);
  // Find all sensor logs after the most recent delimiter, or all sensor logs.
  const potentialBreach = sensorLogs.filtered(
    'timestamp > $0 && aggregation == $1',
    latestDelimiterTimestamp,
    SENSOR_LOG_BREACH_AGGREGATE_TYPE
  );
  // If there are no sensor logs after the delimiter, last aggregated logs finished on a delimiter.
  if (potentialBreach.length === 0) return [];
  const lastSensorLog = potentialBreach[potentialBreach.length - 1];
  //  If the last aggregated log is not a breach aggregate, there is no ongoing breach.
  if (lastSensorLog.aggregation !== SENSOR_LOG_BREACH_AGGREGATE_TYPE) return [];
  // Otherwise, the delimiter is a head log for an ongoing breach.
  return potentialBreach.slice();
};

/**
 * Helper method to convert preAggregate sensor logs to breach aggregate
 * sensor logs. A breach being sequential sensor logs which exceed a given
 * temperature for a given amount of time.
 * Head and tail logs are also set as breachAggregates (logs which directly
 * preceed or follow the first and last sensor log in the breach).
 * Takes all preaggregates from the most recent full aggregate log and
 * applies the following algorithm:
 * Create an object { head, tail, breachLogs }
 * Iterate over all the sensor logs - for each log:
 * If the log exceeds the temperature threshold, add it to the breachLogs
 * array.
 * Otherwise, determine if it is a head or tail log:
 * If breachLogs is non-empty, then it is a tail log. Otherwise it must be
 * the head.
 * After grouping the breaches, determine if each group exceeds the given
 * duration required for a breach. If so, set each aggregation field to
 * breachAggregate, link all itemBatches in the location of the sensorlog.
 * @param {Sensor}   sensor   Sensor object for breaches to be created
 * @param {database} database App wide database accessor
 */
export function createBreaches({ sensor, database }) {
  const { sensorLogs, location } = sensor;
  // Early return where there are no sensor logs or location
  if (!(sensorLogs && sensorLogs.length > 0 && location)) return { success: false };
  const { locationType } = location;
  if (!locationType) return { success: false };
  const { minTemperature, maxTemperature } = locationType;
  // Find the first full aggregate. This will be the point to create breaches from.
  const firstAggregateTime =
    sensorLogs.filtered('aggregation = $0', FULL_AGGREGATE_TYPE).max('timestamp') || new Date(null);
  // Find all pre aggregates, which are potentially breaches
  const preAggregateLogs = sensor.sensorLogs
    .filtered('aggregation = $0 && timestamp >= $1', PREAGGREGATE_TYPE, firstAggregateTime)
    .sorted('timestamp')
    .slice();
  // Early return where there are no preaggregate logs.
  if (!(preAggregateLogs || preAggregateLogs.length)) return { success: false };
  // Inner function, checking a log is beyond either min or max temperature threshold.
  const isBeyondThreshold = sensorLog =>
    minTemperature > sensorLog.temperature || sensorLog.temperature > maxTemperature;
  const breaches = [];
  let breach = { breachLogs: getOngoingBreach({ sensor, database }) };
  // Iterate through each log adding as either the tail, head or as part of the breach itself.
  preAggregateLogs.forEach(log => {
    const { breachLogs } = breach;
    const exceedsTemperature = isBeyondThreshold(log);
    if (exceedsTemperature) breachLogs.push(log);
    else breach[breachLogs.length > 0 ? 'tail' : 'head'] = log;
    if (breach.tail) {
      breaches.push(breach);
      breach = { breachLogs: [] };
    }
  });
  // Double check if the last breach has any logs to push onto the stack.
  if (breach.breachLogs.length > 0) breaches.push(breach);
  // Iterate through each potential breach and create it if it's confirmed.
  // Track the number of breaches created for returning
  const numberOfBreaches = breaches.reduce((accumulator, possibleBreach) => {
    if (createBreach({ breach: possibleBreach, database, locationType })) return accumulator + 1;
    return accumulator;
  }, 0);

  return { success: true, data: { numberOfBreaches } };
}

export function vaccineDisposalAdjustments({
  database,
  record: supplierInvoice,
  user,
  itemBatches,
}) {
  let batchesToDispose;
  // If ItemBatches were passed, making InventoryAdjustments for
  // ItemBatches, rather than for TransactionBatches from a SupplierInvoice
  if (itemBatches) {
    // Any ItemBatch which has an Option, has been set as disposed or has
    // a vvmStatus of failed.
    // Create objects similar to a TransactionBatch for each ItemBatch
    // a part of the InventoryAdjustment.
    batchesToDispose = itemBatches
      .filter(itemBatch => !!itemBatch.option)
      .map(itemBatch => ({
        itemBatch: itemBatch.parentBatch ? itemBatch.parentBatch : itemBatch,
        numberOfPacks: itemBatch.totalQuantity,
        option: itemBatch.option,
        location: itemBatch.location,
      }));
  } else if (supplierInvoice) {
    // When a SupplierInvoice is passed, InventoryAdjustments are made for
    // each VVM Failed TransactionBatch a part of that invoice.
    batchesToDispose = supplierInvoice
      .getTransactionBatches(database)
      .filtered('isVVMPassed = false');
  } else {
    // If neither of the above are passed, prematurely exit.
    return;
  }
  // If there are no batches which should be disposed, prematurely exit.
  if (batchesToDispose.length === 0) return;

  let date = new Date();
  if (supplierInvoice) date = supplierInvoice.confirmDate;
  const isAddition = false;
  // Create an InventoryAdjustment transaction for removing
  // stock.
  database.write(() => {
    const inventoryAdjustment = createRecord(
      database,
      'InventoryAdjustment',
      user,
      date,
      isAddition,
      { status: 'new' }
    );
    // Create the TransactionItem and TransactionBatch for each batch to dispose
    batchesToDispose.forEach(({ itemBatch: batch, numberOfPacks, option, location }) => {
      // Defensively skip this batch if it has no itemBatch, option or the numberOfPacks
      // isn't positive
      if (!(batch || numberOfPacks > 0 || option)) return;

      let itemBatch = batch;
      if (!batch.addTransactionBatch) {
        const id = (batch.parentBatch && batch.parentBatch.id) || batch.id;
        itemBatch = database.objects('ItemBatch').filtered('id = $0', id)[0];
      }
      // Skip this batch if the ItemBatch has no related Item.
      const { item } = itemBatch;
      if (!item) return;

      const transactionItem = createRecord(database, 'TransactionItem', inventoryAdjustment, item);
      createRecord(database, 'TransactionBatch', transactionItem, itemBatch, {
        numberOfPacks,
        isVVMPassed: false,
        option,
        location,
      });
    });
    // Finalise the transaction to make real database changes.
    inventoryAdjustment.finalise(database);
  });
}
