import moment from 'moment';

// Default temperature log generator.
const createTemperatureLog = ({ id, sensor, timestamp, temperature, logInterval }) => ({
  id,
  sensor,
  timestamp: new Date(timestamp),
  temperature,
  logInterval,
});

class TemperatureLogManager {
  constructor(dbService, utils) {
    this.db = dbService;
    this.utils = utils;

    this.createLogFunc = createTemperatureLog;
  }

  set createLog(createLogFunc) {
    this.createLogFunc = createLogFunc;
  }

  get createLog() {
    return this.createLogFunc;
  }

  // Calculates the number of sensor logs that should be saved from some given starting
  // point. Where the starting point is the timestamp for the next log.
  calculateNumberOfLogsToSave = (
    logInterval,
    nextPossibleLogTime = 0,
    timeNow = moment().unix()
  ) => {
    const now = moment.unix(timeNow);
    const startingMoment = moment.unix(nextPossibleLogTime);
    // If the time for the next log is in the future, then don't save any.
    if (startingMoment.isAfter(now)) return 0;
    // Calculate the seconds between the starting time and now.
    const secondsBetween = now.diff(startingMoment, 's', true);

    // For example, if there are 1 log interval between the starting time and now,
    // then the times are for example, 0955 and 1000 - so, we save both the 0955 log
    // and the 1000 log. If there was less than one log interval between, then the
    // times would be 0955 and 0957 - so we only save a single log, as the 1000 log
    // has not been recorded yet.
    return Math.floor(secondsBetween / logInterval) + 1;
  };

  createLogs = (logs, sensor, maxNumberToSave, mostRecentLogTime, timeNow = moment().unix()) => {
    const { logInterval } = sensor;
    const sliceIndex = logs.length - maxNumberToSave;
    const logsToSave = logs.slice(sliceIndex);

    // Calculate the initial timestamp for the logs to be integrated. Either adding a log interval
    // to the most recent temperature logs timestamp, or looking back the number of logs to save
    // times the sensors logging interval. If there exists temperature logs this will align the
    // timestamps rather than having them potentially look random.
    let initial;
    if (mostRecentLogTime == null) {
      initial = moment.unix(timeNow).subtract((logsToSave.length - 1) * logInterval, 'seconds');
    } else {
      initial = moment.unix(mostRecentLogTime).add(logInterval, 's');
    }

    return logsToSave.map(({ temperature }, i) => {
      const offset = logInterval * i;
      const timestamp = Number(moment(initial).add(offset, 's').format('X'));
      const id = this.utils.createUuid();

      return this.createLog({ id, sensor, timestamp, temperature, logInterval });
    });
  };

  saveLogs = async logsToSave => this.db.upsertTemperatureLog(logsToSave);
}

let TemperatureLogManagerInstance;

export const getTemperatureLogManagerInstance = (dbService, utils) => {
  if (!TemperatureLogManagerInstance) {
    TemperatureLogManagerInstance = new TemperatureLogManager(dbService, utils);
  }
  return TemperatureLogManagerInstance;
};

export default getTemperatureLogManagerInstance;
