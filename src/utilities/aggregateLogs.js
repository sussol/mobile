/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Aggregates sensor logs into groups of logs by dates.
 *
 * @param   {Realm.results}  sensorLogs          A collection of sensorLog objects to aggregate.
 * @param   {boolean}        isMax               If true, aggregate by maximum temperature, else
 *                                               by minimum temperature.
 * @param   {number}         numberOfDataPoints  Number of aggregated data points to return.
 * @param   {Date}           startDate           Start date of temperature range to aggregate
 *                                               over.
 * @param   {Date}           endDate             End date of temperature range to aggregate over.
 * @return  {Object[]}                           Aggregated sensor logs, array of objects in form
 *                                              [{timestamp}, {temperature},...].
 */
export const aggregateLogs = ({
  sensorLogs,
  numberOfIntervals,
  isMax = true,
  startDate = new Date(),
  endDate = new Date(),
}) => {
  // Break out if no sensorLogs.
  if (!(sensorLogs.length > 0)) return [];

  // Sort sensor logs ascending by date.
  sensorLogs.sorted('timestamp');

  // If start date is later than earliest log, update.
  const startLog = sensorLogs[0];
  startDate = startDate > startLog.timestamp ? startLog.timestamp : startDate;

  // If end date is earlier than latest date in data, update.
  const endLog = sensorLogs[sensorLogs.length - 1];
  endDate = endDate < endLog.timestamp ? endLog.timestamp : endDate;

  // Calculate duration of each interval in milliseconds.
  const totalDuration = endDate - startDate;
  const intervalDuration = totalDuration / numberOfIntervals;

  // Generate interval boundaries.
  const aggregatedLogs = [];
  for (let i = 0; i < numberOfIntervals; i += 1) {
    const intervalStartDate = new Date(startDate.getTime() + intervalDuration * i);
    const intervalEndDate = new Date(startDate.getTime() + intervalDuration * (i + 1) - 1);
    aggregatedLogs.push({ intervalStartDate, intervalEndDate });
  }

  // Map intervals to aggregated objects.
  aggregatedLogs.forEach(({ intervalStartDate, intervalEndDate }, index) => {
    // Calculate median date.
    aggregatedLogs[index].medianDate = new Date(
      intervalStartDate.getTime() + (intervalEndDate.getTime() - intervalStartDate.getTime()) / 2
    );

    // Get sensor logs.
    aggregatedLogs[index].sensorLogs = sensorLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      intervalStartDate,
      intervalEndDate
    );

    // Get maximum or minimum log.
    const getMinMaxLog = isMax
      ? (previousLog, currentLog) =>
          previousLog.temperature > currentLog.temperature ? previousLog : currentLog
      : (previousLog, currentLog) =>
          previousLog.temperature < currentLog.temperature ? previousLog : currentLog;

    aggregatedLogs[index].sensorLog = aggregatedLogs[index].sensorLogs.reduce(
      (accLog, currentLog) => getMinMaxLog(accLog, currentLog)
    );
  });

  return aggregatedLogs;
};

export default aggregateLogs;
