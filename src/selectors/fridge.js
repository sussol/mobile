/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */
import moment from 'moment';
import { createSelector } from 'reselect';
import { UIDatabase } from '../database';
import { chunk } from '../utilities';
import { CHART_CONSTANTS, VACCINE_CONSTANTS } from '../utilities/modules/vaccines/constants';

export const selectSelectedFridgeID = ({ fridge }) => {
  const { selectedFridge = {} } = fridge;
  const { id } = selectedFridge;

  return id;
};

export const selectFridgeState = ({ fridge }) => fridge;

export const selectSelectedFridge = createSelector([selectSelectedFridgeID], selectedFridgeID => {
  const selectedFridge = UIDatabase.get('Location', selectedFridgeID);

  return selectedFridge;
});

export const selectFridgeTemperatureLogs = createSelector([selectSelectedFridge], fridge => {
  const { temperatureLogs = {} } = fridge ?? {};

  return temperatureLogs.sorted?.('timestamp') ?? [];
});

export const selectLeastRecentTemperatureLogDate = createSelector(
  [selectSelectedFridge],
  fridge => {
    const { leastRecentTemperatureLog } = fridge;

    const { timestamp: minimumDate } = leastRecentTemperatureLog ?? {};

    return minimumDate;
  }
);

export const selectMostRecentTemperatureLogDate = createSelector([selectSelectedFridge], fridge => {
  const { mostRecentTemperatureLog } = fridge;

  const { timestamp: minimumDate } = mostRecentTemperatureLog ?? {};

  return minimumDate;
});

export const selectTemperatureLogsFromDate = createSelector(
  [selectFridgeState, selectLeastRecentTemperatureLogDate],
  (fridgeState, minimumDate) => {
    const { fromDate } = fridgeState;
    return moment.max([moment(fromDate), moment(minimumDate)]).toDate();
  }
);

export const selectTemperatureLogsToDate = createSelector(
  [selectFridgeState, selectMostRecentTemperatureLogDate],
  (fridgeState, maximumDate) => {
    const { toDate } = fridgeState;
    return moment.min([moment(toDate), moment(maximumDate)]).toDate();
  }
);

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

    // If the number of temperature logs is less than the maximum number of data points,
    // then the array does not need to be chunked together - however still need to create
    // a 2D array, so chunk with a chunk size of 1.
    return chunk(logs, Math.ceil(numberOfLogs / CHART_CONSTANTS.MAX_DATA_POINTS));
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

    return breachesInDateRange;
  }
);

export const selectAdjustedBreaches = createSelector(
  [selectFridgeTemperatureLogsFromDate, selectBreaches],
  (fromDate, breaches) => {
    // If a breach started before the date range but is still on going, adjust the start date to
    // be the minimum date in the chart.
    const adjustedBreaches = breaches.map(({ timestamp, id, temperature }) => ({
      id,
      temperature,
      timestamp: moment(timestamp).isBefore(moment(fromDate)) ? fromDate : timestamp,
    }));

    return adjustedBreaches;
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

export const selectNumberOfHotConsecutiveBreaches = createSelector([selectBreaches], breaches => {
  const hotBreaches = breaches?.filtered("type == 'HOT_CONSECUTIVE'");
  return hotBreaches.length;
});

export const selectNumberOfColdConsecutiveBreaches = createSelector([selectBreaches], breaches => {
  const coldBreaches = breaches?.filtered("type == 'COLD_CONSECUTIVE'");
  return coldBreaches.length;
});

const formatTime = sum => {
  const asMoment = moment.duration(sum);

  const asDays = Math.floor(asMoment.asDays());
  const asHours = Math.floor(asMoment.asHours());
  const asMinutes = Math.floor(asMoment.asMinutes());

  const lengthOfHours = String(asHours).length;
  const lengthOfMinutes = String(asMinutes).length;

  const addSuffix = (amount, suffix) => `${amount} ${suffix}`;

  if (lengthOfMinutes < 3) return addSuffix(asMinutes, 'm');
  if (lengthOfHours < 3) return addSuffix(asHours, 'h');

  return addSuffix(asDays, 'd');
};

export const selectHotCumulativeBreach = createSelector(
  [selectSelectedFridge, selectFridgeTemperatureLogsFromDate],
  (fridge, logs) => {
    const { hotCumulativeBreachConfig } = fridge;

    const { minimumTemperature, duration } = hotCumulativeBreachConfig;

    const logsOverThreshold = logs.filtered('temperature >= $0', minimumTemperature);
    const sum = logsOverThreshold.sum('logInterval') ?? 0;
    const hasCumulativeBreach = sum >= duration && duration;

    return hasCumulativeBreach ? formatTime(sum * 1000) : null;
  }
);

export const selectColdCumulativeBreach = createSelector(
  [selectSelectedFridge, selectFridgeTemperatureLogsFromDate],
  (fridge, logs) => {
    const { coldCumulativeBreachConfig } = fridge;

    const { maximumTemperature, duration } = coldCumulativeBreachConfig;

    const logsOverThreshold = logs.filtered('temperature <= $0', maximumTemperature);
    const sum = logsOverThreshold.sum('logInterval') ?? 0;
    const hasCumulativeBreach = sum >= duration && duration;

    return hasCumulativeBreach ? formatTime(sum * 1000) : null;
  }
);

export const selectAverageTemperature = createSelector(
  [selectFridgeTemperatureLogsFromDate],
  logs => {
    // Aggregate methods return undefined if the collection is empty.
    // Return early to avoid having to handle falsey values (the
    // average can be 0 which is a valid value but undefined is not)
    if (!logs.length) return null;

    const averageTemperature = logs.avg('temperature');
    return Number(averageTemperature).toFixed(1);
  }
);

export const selectSelectedFridgeIsInHotBreach = state => {
  const fridge = selectSelectedFridge(state);
  const { isInHotBreach } = fridge;
  return isInHotBreach;
};

export const selectSelectedFridgeIsInColdBreach = state => {
  const fridge = selectSelectedFridge(state);
  const { isInColdBreach } = fridge;
  return isInColdBreach;
};

export const selectSelectedFridgeIsLowBattery = state => {
  const fridge = selectSelectedFridge(state);
  const { batteryLevel } = fridge;
  return batteryLevel <= VACCINE_CONSTANTS.LOW_BATTERY_PERCENTAGE;
};

export const selectSelectFridgeCurrentTemperature = state => {
  const fridge = selectSelectedFridge(state);
  const { currentTemperature } = fridge;
  return currentTemperature;
};
