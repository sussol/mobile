/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Get daily intervals between two dates.
 *
 * @param  {Date}  startDate
 * @param  {Date}  endDate
 */
const getDailyIntervals = (startDate, endDate) => {
  const dates = [];
  const date = startDate;
  while (date <= endDate) {
    dates.push(new Date(date.getTime()));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

/**
 * Get hourly intervals between two dates.
 *
 * @param  {Date}  startDate
 * @param  {Date}  endDate
 */
const getHourlyIntervals = (startDate, endDate) => {
  const dates = [];
  const date = startDate;
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setHours(date.getHours() + 1);
  }

  return dates;
};

/**
 * Aggregates sensor logs into groups of logs by dates.
 *
 * @param   {Realm.results, Object[]}  data                An array of sensorLog objects to
 *                                                         aggregate.
 * @param   {boolean}                  isMax               If true, aggregate by max temperature,
 *                                                         else min temperature.
 * @param   {number}                   numberOfDataPoints  Number of aggregated data points to
 *                                                         return.
 * @param   {Date}                     startDate           Start date of temperature range to
 *                                                         aggregate over.
 * @param   {Date}                     endDate             End date of temperature range to
 *                                                         aggregate over.
 * @return  {Object[]}                                     Aggregated sensor logs, array of objects
 *                                                         in form [{timestamp}, {temperature},...].
 */
export const aggregateLogs = ({ data, isMax, numberOfDataPoints, startDate, endDate }) => {
  // If start date is later than earliest date in data, update.
  startDate = data.reduce(
    (currentDate, { timestamp }) => (timestamp < currentDate ? timestamp : currentDate),
    startDate
  );

  // If end date is earlier than latest date in data, update.
  endDate = data.reduce(
    (currentDate, { timestamp }) => (timestamp > currentDate ? timestamp : currentDate),
    endDate
  );

  // Get dates spanning start and end dates. If differences between start and end date
  // is less than three, use hourly intervals, otherwise daily.
  const dates =
    endDate.getDate() - startDate.getDate() < 3
      ? getHourlyIntervals(startDate, endDate)
      : getDailyIntervals(startDate, endDate);

  // Get dates marking end date of each interval. Rounds to dynamically size
  // boundaries to minimise differences in number of data points in each window.
  const intervalBoundaries = Array.from(
    { length: numberOfDataPoints },
    (_, index) => index + 1
  ).map(index =>
    index === numberOfDataPoints
      ? dates[dates.length - 1]
      : dates[index * Math.round(dates.length / numberOfDataPoints) - 1]
  );

  // Aggregate data into intervals.
  const logsByInterval = Array(intervalBoundaries.length)
    .fill()
    .map(() => []);
  data.forEach(log => {
    let i = 0;
    while (log.timestamp > intervalBoundaries[i]) i += 1;
    logsByInterval[i].push(log);
  });

  // Get date, max/min of each interval.
  const aggregatedLogs = logsByInterval.map(interval => {
    const { timestamp } = interval[Math.floor(interval.length / 2)];
    const { temperature } = interval.reduce((minMaxLog, currentLog) => {
      const { temperature: currentTemperature } = currentLog;
      const { temperature: minMaxTemperature } = minMaxLog;

      const isMinMaxTemp = isMax
        ? currentTemperature > minMaxTemperature
        : currentTemperature < minMaxTemperature;

      return isMinMaxTemp ? currentLog : minMaxLog;
    });

    return { timestamp, temperature };
  });

  return aggregatedLogs;
};

export default aggregateLogs;
