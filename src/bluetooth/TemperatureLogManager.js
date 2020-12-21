import moment from 'moment';

// Default temperature log generator.
const createTemperatureLog = ({ id, sensor, timestamp, temperature, logInterval }) => ({
  id,
  sensor,
  timestamp: new Date(timestamp),
  temperature,
  logInterval,
});

export class TemperatureLogManager {
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

    let initial;
    if (!mostRecentLogTime) {
      initial = moment.unix(timeNow);
      initial.subtract((logsToSave.length - 1) * logInterval, 'seconds');
    } else {
      const now = moment();
      now.subtract(mostRecentLogTime);

      // Take the most recent log timestamp and count log intervals until now,
      // then, remove the log intervals for the number we are saving up to.

      initial = moment(
        mostRecentLogTime.format('x') +
          (maxNumberToSave * logInterval - maxNumberToSave * logInterval)
      );
    }

    return logsToSave.map(({ temperature }, i) => {
      const offset = logInterval * i;
      const timestamp = Number(moment(initial).add(offset, 's').format('X'));
      const id = this.utils.createUuid();

      return this.createLog({ id, sensor, timestamp, temperature, logInterval });
    });
  };

  saveLogs = async logsToSave => this.db.update('TemperatureLog', logsToSave);
}
