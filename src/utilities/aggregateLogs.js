// Get daily intervals between two dates.
const getDailyIntervals = (startDate, endDate) => {
  const dates = [];
  const date = startDate;
  while (date <= endDate) {
    dates.push(new Date(date.getTime()));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

// Get hourly intervals between two dates.
const getHourlyIntervals = (startDate, endDate) => {
  const dates = [];
  const date = startDate;
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setHours(date.getHours() + 1);
  }

  return dates;
};

const aggregateLogs = ({ data, isMax, numberOfDataPoints, startDate, endDate }) => {
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
  const aggregatedData = Array(intervalBoundaries.length)
    .fill()
    .map(() => []);
  data.forEach(datum => {
    let i = 0;
    while (datum.timestamp > intervalBoundaries[i]) {
      i += 1;
    }
    aggregatedData[i].push(datum);
  });

  // Get date, max/min of each interval.
  const aggregatedTemps = aggregatedData.map(interval => {
    const { timestamp } = interval[Math.floor(interval.length / 2)];
    const { temperature } = interval.reduce((minMaxDatum, datum) => {
      const { temperature: currentTemperature } = datum;
      const { temperature: minMaxTemperature } = minMaxDatum;

      const isMinMaxTemp = isMax
        ? currentTemperature > minMaxTemperature
        : currentTemperature < minMaxTemperature;

      return isMinMaxTemp ? datum : minMaxDatum;
    });

    return { timestamp, temperature };
  });

  return aggregatedTemps;
};
const data = [
  {
    timestamp: new Date('January 1'),
    temperature: 1,
  },
  {
    timestamp: new Date('January 2'),
    temperature: 3,
  },
  {
    timestamp: new Date('January 3'),
    temperature: 2,
  },
  {
    timestamp: new Date('January 4'),
    temperature: 2,
  },
  {
    timestamp: new Date('January 5'),
    temperature: 2,
  },
  {
    timestamp: new Date('January 6'),
    temperature: 2,
  },
  {
    timestamp: new Date('January 7'),
    temperature: 2,
  },
  {
    timestamp: new Date('January 8'),
    temperature: 6,
  },
];

const numberOfDataPoints = 3;

aggregateLogs({
  data,
  isMax: true,
  numberOfDataPoints,
  startDate: new Date('January 1'),
  endDate: new Date('January 8'),
});
