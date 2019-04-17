const getDailyIntervals = (startDate, endDate) => {
  const dates = [];
  const date = startDate;
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

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
  // Get dates spanning start and end dates. If differences between start and end date
  // is less than three, use hourly intervals, otherwise daily.
  const dates =
    endDate.getDate() - startDate.getDate() < 3
      ? getHourlyIntervals(startDate, endDate)
      : getDailyIntervals(startDate, endDate);

  // Get dates marking end date of each interval. Rounds to dynamically size
  // boundaries to minimise differences in boundary size.
  const intervalBoundaries = Array.from(
    { length: numberOfDataPoints },
    (_, index) => index + 1
  ).map(interval =>
    interval === numberOfDataPoints
      ? dates[dates.length - 1]
      : dates[interval * Math.round(dates.length / numberOfDataPoints) - 1]
  );

  // Aggregate data into intervals.
  const aggregatedData = Array(intervalBoundaries.length)
    .fill()
    .map(() => []);
  data.forEach(datum => {
    let i = 0;
    while (datum.timestamp > intervalBoundaries[i] && datum.timestamp < endDate) {
      i += 1;
    }
    aggregatedData[i].push(datum);
  });
};

const data = [
  {
    timestamp: new Date('January 1'),
    temperature: 1,
  },
  {
    timestamp: new Date('January 2'),
    temperature: 2,
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
    temperature: 2,
  },
];

const numberOfDataPoints = 3;

aggregateLogs({
  data,
  numberOfDataPoints,
  startDate: new Date('January 1'),
  endDate: new Date('January 8'),
});
