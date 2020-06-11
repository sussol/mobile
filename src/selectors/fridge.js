/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';
import { createSelector } from 'reselect';
import { UIDatabase } from '../database';
import { chunk } from '../utilities/chunk';

export const selectSelectedFridgeID = ({ fridge }) => {
  const { selectedFridge = {} } = fridge;
  const { id } = selectedFridge;

  return id;
};

export const selectTemperatureLogsFromDate = ({ fridge }) => {
  const { fromDate } = fridge;

  return fromDate;
};

export const selectTemperatureLogsToDate = ({ fridge }) => {
  const { toDate } = fridge;

  return toDate;
};

export const selectSelectedFridge = createSelector([selectSelectedFridgeID], selectedFridgeID => {
  const selectedFridge = UIDatabase.get('Location', selectedFridgeID);

  return selectedFridge;
});

export const selectFridgeTemperatureLogs = createSelector([selectSelectedFridge], fridge => {
  const { temperatureLogs = {} } = fridge ?? {};

  return temperatureLogs.sorted?.('timestamp') ?? [];
});

export const selectFridgeTemperatureLogsFromDate = createSelector(
  [selectFridgeTemperatureLogs, selectTemperatureLogsFromDate, selectTemperatureLogsToDate],
  (logs, fromDate, toDate) => {
    const temperatureLogs =
      logs?.filtered?.('timestamp >= $0 && timestamp =< $1', fromDate, toDate) ?? [];

    return temperatureLogs;
  }
);

export const selectChunkedTemperatureLogs = createSelector(
  [selectFridgeTemperatureLogsFromDate],
  logs => {
    const { length: numberOfLogs } = logs;
    const MAX_DATA_POINTS = 30;

    // If the number of temperature logs is less than the maximum number of data points,
    // then the array does not need to be chunked together - however still need to create
    // a 2D array, so chunk with a chunk size of 1.
    return chunk(
      logs,
      numberOfLogs < MAX_DATA_POINTS ? 1 : Math.ceil(numberOfLogs / MAX_DATA_POINTS)
    );
  }
);

export const selectMinAndMaxLogs = createSelector([selectChunkedTemperatureLogs], logs =>
  logs.reduce(
    (acc, logGroup) => {
      const temperatures = logGroup.map(({ temperature }) => temperature);
      const timestamps = logGroup.map(({ timestamp }) => timestamp);

      const maxTemperature = Math.max(...temperatures);
      const minTemperature = Math.min(...temperatures);
      const timestamp = Math.min(...timestamps);

      const { minLine, maxLine } = acc;

      return {
        minLine: [...minLine, { temperature: minTemperature, timestamp }],
        maxLine: [...maxLine, { temperature: maxTemperature, timestamp }],
      };
    },
    { minLine: [], maxLine: [] }
  )
);

export const selectMinAndMaxDomains = createSelector([selectMinAndMaxLogs], minAndMaxLogs => {
  const { minLine, maxLine } = minAndMaxLogs;

  return {
    minDomain: Math.min(...minLine.map(({ temperature }) => temperature)),
    maxDomain: Math.max(...maxLine.map(({ temperature }) => temperature)),
  };
});

export const selectBreaches = createSelector(
  [selectTemperatureLogsFromDate, selectTemperatureLogsToDate, selectSelectedFridge],
  (fromDate, toDate, fridge) => {
    const { breaches } = fridge ?? {};
    const breachesInDateRange = breaches?.filtered(
      '(startTimestamp <= $0 && (endTimestamp >= $0 || endTimestamp == null)) || ' +
        '(startTimestamp >= $0 && startTimestamp <= $1)',
      fromDate,
      toDate
    );

    const adjustedBreaches = breachesInDateRange?.map(({ timestamp, id, temperature }) => ({
      id,
      temperature,
      timestamp: moment(timestamp).isBefore(moment(fromDate)) ? fromDate : timestamp,
    }));

    return adjustedBreaches ?? [];
  }
);

export const selectTimestampFormatter = createSelector(
  [selectTemperatureLogsFromDate, selectTemperatureLogsToDate],
  (fromDate, toDate) => {
    const durationInDays = moment(toDate).diff(moment(fromDate), 'days', true);

    const time = 'HH:MM';
    const date = 'DD/MM';
    const dateAndTime = `${time} - ${date}`;

    const getTickFormat = format => tick => moment(tick).format(format);

    if (durationInDays <= 1) return getTickFormat(time);
    if (durationInDays <= 3) return getTickFormat(dateAndTime);

    return getTickFormat(date);
  }
);
