/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Aggregates sensor logs into groups of logs by dates.
 *
 * @param   {Realm.results}  sensorLogs          A collection of sensorLog objects to aggregate.
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
  startDate = null,
  endDate = null,
}) => {
  if (!(sensorLogs.length > 0)) return [];

  // Update date boundaries.

  sensorLogs.sorted('timestamp');

  // Generate interval boundaries.

  const { timestamp: startTimestamp } = sensorLogs[0];
  const { timestamp: endTimestamp } = sensorLogs[sensorLogs.length - 1];

  const startBoundary = new Date(Math.min(startTimestamp, startDate) || startTimestamp);
  const endBoundary = new Date(Math.max(endTimestamp, endDate) || endTimestamp);

  // Caclulate interval duration in ms.
  const totalDuration = endBoundary - startBoundary;
  const intervalDuration = totalDuration / numberOfIntervals;

  const aggregatedLogs = [];
  for (let i = 0; i < numberOfIntervals; i += 1) {
    const intervalStartDate = new Date(startBoundary.getTime() + intervalDuration * i);
    const intervalEndDate = new Date(startBoundary.getTime() + intervalDuration * (i + 1) - 1);
    aggregatedLogs.push({ intervalStartDate, intervalEndDate });
  }

  // Offset last end date to prevent not including last log.
  aggregatedLogs[aggregatedLogs.length - 1].intervalEndDate += 1;

  // Map intervals to aggregated objects.
  const medianDuration = intervalDuration / 2;
  aggregatedLogs.map(aggregateLog => {
    const { intervalStartDate, intervalEndDate } = aggregateLog;

    // Group sensor logs by interval.
    const intervalLogs = sensorLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      intervalStartDate,
      intervalEndDate
    );

    // Calculate aggregated log date.
    const timestamp = new Date(intervalStartDate.getTime() + medianDuration);

    // Get minimum and maximum logs for each interval.
    const minTemperature = intervalLogs.min('temperature');
    const maxTemperature = intervalLogs.max('temperature');

    return { timestamp, minTemperature, maxTemperature };
  });

  return aggregatedLogs;
};

export default aggregateLogs;
