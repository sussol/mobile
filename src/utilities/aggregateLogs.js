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

  const totalDuration = endBoundary - startBoundary;
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
    const medianDate = new Date(intervalStartDate.getTime() + medianDuration);

    // Group sensor logs by interval.
    aggregatedLogs[index].sensorLogs = sensorLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      intervalStartDate,
      intervalEndDate
    );

    const minTemperature = aggregatedLogs[index].sensorLogs.min('temperature');
    const maxTemperature = aggregatedLogs[index].sensorLogs.max('temperature');

    // Get minimum and maximum logs for each interval.
    aggregatedLogs[index].minimumLog = {
      timestamp: medianDate,
      temperature: minTemperature,
    };

    aggregatedLogs[index].maximumLog = {
      timestamp: medianDate,
      temperature: maxTemperature,
    };
  });

  return aggregatedLogs;
};

export default aggregateLogs;
