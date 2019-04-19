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
  startDate = null,
  endDate = null,
}) => {
  if (!(sensorLogs.length > 0)) return [];

  // Update date boundaries.

  sensorLogs.sorted('timestamp');

  // Generate interval boundaries.

  const [{ timestamp: startTimestamp }, , { timestamp: endTimestamp }] = sensorLogs;

  const startBoundary = Math.min(startDate, startTimestamp) || startTimestamp;
  const endBoundary = Math.max(endDate, endTimestamp) || endTimestamp;

  const totalDuration = startBoundary - endBoundary;
  const intervalDuration = totalDuration / numberOfIntervals;

  const aggregatedLogs = [];
  for (let i = 0; i < numberOfIntervals; i += 1) {
    const intervalStartDate = new Date(startBoundary.getTime() + intervalDuration * i);
    const intervalEndDate = new Date(startBoundary.getTime() + intervalDuration * (i + 1) - 1);
    aggregatedLogs.push({ intervalStartDate, intervalEndDate });
  }

  // Map intervals to aggregated objects.

  aggregatedLogs.forEach(({ intervalStartDate, intervalEndDate }, index) => {
    // Calculate median date.
    const medianDuration = (intervalEndDate.getTime() - intervalStartDate.getTime()) / 2;
    aggregatedLogs[index].medianDate = new Date(intervalStartDate.getTime() + medianDuration);

    // Group sensor logs by interval.
    aggregatedLogs[index].sensorLogs = sensorLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      intervalStartDate,
      intervalEndDate
    );

    // Get maximum or minimum log for each interval.
    aggregatedLogs[index].sensorLog = isMax
      ? aggregatedLogs[index].sensorLogs.max('temperature')
      : aggregatedLogs[index].sensorLogs.min('temperature');
  });

  return aggregatedLogs;
};

export default aggregateLogs;
