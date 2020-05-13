/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { createSelector } from 'reselect';
import { UIDatabase } from '../database/index';
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
      logs?.filtered?.('timestamp > $0 && timestamp < $1', fromDate, toDate) ?? [];

    return temperatureLogs;
  }
);

export const selectChunkedTemperatureLogs = createSelector(
  [selectFridgeTemperatureLogsFromDate],
  logs => {
    const { length: numberOfLogs } = logs;

    return numberOfLogs < 30 ? logs : chunk(logs, Math.ceil(numberOfLogs / 30));
  }
);

export const selectMinAndMaxLogs = createSelector(selectChunkedTemperatureLogs, logs =>
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

export const selectMinAndMaxDomains = createSelector(selectMinAndMaxLogs, minAndMaxLogs => {
  const { minLine, maxLine } = minAndMaxLogs;

  return {
    minDomain: Math.min(...minLine.map(({ temperature }) => temperature)),
    maxDomain: Math.max(...maxLine.map(({ temperature }) => temperature)),
  };
});

export const selectBreaches = createSelector([selectSelectedFridge], fridge => {
  const { breaches } = fridge ?? {};

  return breaches;
});
