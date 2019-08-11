import {
  linkSensorLogToItemBatches,
  createFullAggregateSensorLogs,
  createGenericSensorLog,
} from './utilities';

/**
 * Aggregation methods for SensorLogs. PreAggregate
 * and FullAggregate.
 *
 * Preaggregates are aggregations of raw data synced
 * from a sensor. Sensors can be quite sensitive to
 * temperatures, so a shorter interval is used on a
 * physical sensor to achieve a more representitive
 * temperature once aggregated.
 *
 * Full aggregations are much larger consolidations
 * of sensor logs in which a breach has not occurred,
 * to limit the number of SensorLog records as well
 * as SensorLogItemBatchJoins.
 */

const PREAGGREGATE_TYPE = 'preAggregate';
const FULL_AGGREGATE_TYPE = 'aggregate';

const ONE_MINUTE_MILLISECONDS = 1000 * 60;
const ONE_HOUR_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 60;
const FIVE_MINUTES_MILLISECONDS = ONE_MINUTE_MILLISECONDS * 5;
const EIGHT_HOURS_MILLISECONDS = ONE_HOUR_MILLISECONDS * 8;

const NO_FULL_AGGREGATE_PERIOD = EIGHT_HOURS_MILLISECONDS * 4 + FIVE_MINUTES_MILLISECONDS;
const FULL_AGGREGATION_INTERVAL = EIGHT_HOURS_MILLISECONDS + FIVE_MINUTES_MILLISECONDS;
const PREAGGREGATE_INTERVAL = 20 * ONE_MINUTE_MILLISECONDS;
/**
 * Aggregates sensor logs that have been pulled from a physical sensor.
 */
export function preAggregateLogs({ sensor, database }) {
  const { location } = sensor;
  let logsToDelete = [];
  const logsToAdd = [];
  const sortedLogs = sensor.sensorLogs
    .filtered('aggregation == null || aggregation == ""')
    .sorted('timestamp');
  let firstTimestamp = sortedLogs[0].timestamp;
  let endTimestamp = new Date(firstTimestamp.getTime() + PREAGGREGATE_INTERVAL);
  let logsToDeleteTemp = [];
  let temperature = Infinity;
  sortedLogs.forEach(sensorLog => {
    const { timestamp: logTimestamp, temperature: logTemperature } = sensorLog;
    // If this sensorlog does exceed the aggregated end timestamp, check if it has
    // the minimum temperature and push it onto the potential delete stack, to be
    // deleted if it is included in an aggregation.
    if (logTimestamp <= endTimestamp) {
      logsToDeleteTemp.push(sensorLog);
      if (temperature > sensorLog.temperature) temperature = logTemperature;
    } else {
      logsToDelete = [...logsToDelete, ...logsToDeleteTemp];
      logsToDeleteTemp = [sensorLog];
      logsToAdd.push(
        createGenericSensorLog({
          sensor,
          location,
          temperature,
          timestamp: endTimestamp,
          aggregation: PREAGGREGATE_TYPE,
        })
      );
      // If the currentlogs timestamp is greater than the end timestamp of the current
      // aggregation, increment the timestamps for the next aggregation.
      while (logTimestamp >= new Date(endTimestamp)) {
        firstTimestamp = endTimestamp;
        endTimestamp = new Date(endTimestamp.getTime() + PREAGGREGATE_INTERVAL);
      }
      // Reset temperature and timestamps;
      temperature = Infinity;
    }
  });

  database.write(() => {
    logsToAdd.forEach(sensorLog => {
      const newSensorLog = database.update('SensorLog', sensorLog);
      sensor.sensorLogs.push(newSensorLog);
    });
  });

  database.write(() => {
    logsToDelete.forEach(sensorLog => {
      database.delete('SensorLog', sensorLog);
    });
  });

  return { success: true };
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
  // Want to leave at least the last 32 hours unaggregated. Also want to only
  // aggregate the most recently added preAggregate logs, from the most
  // most recent fullAggregation log.
  const mostRecentFullAggregateTimestamp = sensorLogs
    .filtered('aggregation == $0', FULL_AGGREGATE_TYPE)
    .max('timestamp');
  const mostRecentPreAggregateTimestamp = sensorLogs
    .filtered('aggregation == $0', PREAGGREGATE_TYPE)
    .max('timestamp');
  // Starting timestamp is either from the first fullAggregate timestamp, or beginning of time
  const aggregationIntervalStart = mostRecentFullAggregateTimestamp || new Date(null);
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
      PREAGGREGATE_TYPE,
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
}
