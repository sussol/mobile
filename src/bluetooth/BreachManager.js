import moment from 'moment';
import { MILLISECONDS } from '../utilities/constants';

// Default breach creation method.
const createBreachRecord = (
  uuid,
  sensor,
  temperatureBreachConfiguration,
  startTimestamp,
  endTimestamp
) => {
  const {
    minimumTemperature: thresholdMinTemperature,
    maximumTemperature: thresholdMaxTemperature,
    duration: thresholdDuration,
    type,
  } = temperatureBreachConfiguration;
  const id = uuid;
  const { location } = sensor;

  return {
    id,
    sensor,
    thresholdMinTemperature,
    thresholdMaxTemperature,
    thresholdDuration,
    type,
    startTimestamp: new Date(startTimestamp * MILLISECONDS.ONE_SECOND),
    endTimestamp: endTimestamp ? new Date(endTimestamp * MILLISECONDS.ONE_SECOND) : endTimestamp,
    location,
    acknowledged: false,
  };
};

class BreachManager {
  constructor(dbWrapper, utils) {
    this.db = dbWrapper;
    this.utils = utils;

    this.createBreachFunc = createBreachRecord;
  }

  set createBreach(createBreachFunc) {
    this.createBreachFunc = createBreachFunc;
  }

  get createBreach() {
    return this.createBreachFunc;
  }

  closeBreach = (temperatureBreach, time) => {
    // eslint-disable-next-line no-param-reassign
    temperatureBreach.endTimestamp = new Date(time * MILLISECONDS.ONE_SECOND);
    return temperatureBreach;
  };

  createBreachesFrom = async sensorId => {
    const { timestamp = moment(0).unix() } = (await this.db.getMostRecentBreachLog(sensorId)) ?? {};
    return timestamp;
  };

  getLogsToCheck = async sensorId => {
    const timeToCheckFrom = await this.createBreachesFrom(sensorId);
    return this.db.getTemperatureLogsFrom(sensorId, timeToCheckFrom);
  };

  willCreateBreach = (config, logs) => {
    if (!logs.length) return false;
    const { minimumTemperature, maximumTemperature, duration } = config;
    const { timestamp: endTimestamp } = logs[logs.length - 1];
    const { timestamp: startTimestamp } = logs[0];

    // logsDuration will be in seconds as it is based on unixtime
    // we are storing duration as milliseconds, so will have to scale to compare
    const logsDuration = MILLISECONDS.ONE_SECOND * (endTimestamp - startTimestamp);

    if (logsDuration < duration) return false;
    const temperaturesWithinBounds = logs.every(log => {
      const { temperature } = log;
      return temperature <= maximumTemperature && temperature >= minimumTemperature;
    });

    return temperaturesWithinBounds;
  };

  willCreateBreachFromConfigs = (configs, logs) => {
    const configToCreateBreachFrom = configs.find(config => this.willCreateBreach(config, logs));
    return [!!configToCreateBreachFrom, configToCreateBreachFrom];
  };

  // Previously used object spread, but https://github.com/realm/realm-js/issues/2844
  // Fortunately the `temperatureLog` array only needs the log.id and the breach.id
  // it's being assigned
  addLogToBreach = (breach, log) => ({ id: log.id, breach });

  willContinueBreach = (breach, log) => {
    if (!breach) return false;
    const { thresholdMaxTemperature, thresholdMinTemperature } = breach;
    const { temperature } = log;

    return temperature >= thresholdMinTemperature && temperature <= thresholdMaxTemperature;
  };

  willCloseBreach = (breach, log) => {
    if (!(breach && log)) return false;
    const { thresholdMaxTemperature, thresholdMinTemperature } = breach;
    const { temperature } = log;
    return !(temperature >= thresholdMinTemperature && temperature <= thresholdMaxTemperature);
  };

  getConfigInBreach = (log, configs) =>
    configs.find(
      config =>
        log.temperature >= config.minimumTemperature && log.temperature <= config.maximumTemperature
    );

  createBreaches = (sensor, logs, configs, mostRecentBreach) => {
    const potentialBreach = { configInBreach: null, logs: [] };
    let currentBreach = mostRecentBreach;

    const breaches = mostRecentBreach && !mostRecentBreach.endTimestamp ? [mostRecentBreach] : [];
    const temperatureLogs = [];

    logs.forEach(log => {
      const configInBreach = this.getConfigInBreach(log, configs);
      const willCloseBreach = this.willCloseBreach(currentBreach, log);
      const willContinueBreach = this.willContinueBreach(currentBreach, log);

      if (willCloseBreach) {
        this.closeBreach(currentBreach, log.timestamp);
        currentBreach = null;
        potentialBreach.logs = [];
        potentialBreach.configInBreach = null;
      }

      if (configInBreach) {
        // If current log is in breach of the same config as the rest of the stack,
        // push the current log onto the stack
        if (potentialBreach.configInBreach === configInBreach) {
          potentialBreach.logs.push(log);
        } else {
          // If the log is in breach of a different config as the existing stack,
          // clear the breach config and log stack before pushing new log and config on
          potentialBreach.logs = [];
          potentialBreach.configInBreach = configInBreach;
          potentialBreach.logs.push(log);
        }
      } else {
        potentialBreach.logs = [];
        potentialBreach.configInBreach = null;
      }

      if (willContinueBreach) {
        const updatedLog = this.addLogToBreach(currentBreach, log);
        temperatureLogs.push(updatedLog);
      }

      if (!willContinueBreach) {
        const [willCreateBreach, config] = this.willCreateBreachFromConfigs(
          configs,
          potentialBreach.logs
        );

        if (willCreateBreach) {
          const newBreach = this.createBreach(
            this.utils.createUuid(),
            sensor,
            config,
            potentialBreach.logs[0].timestamp
          );

          currentBreach = newBreach;
          breaches.push(newBreach);
          const updatedLogs = potentialBreach.logs.map(l => this.addLogToBreach(newBreach, l));
          updatedLogs.forEach(ul => temperatureLogs.push(ul));
        }
      }
    });
    return [breaches, temperatureLogs];
  };

  updateBreaches = async (breaches, temperatureLogs) => {
    const updatedBreaches = await this.db.upsertBreaches(breaches);
    const updatedLogs = await this.db.upsertTemperatureLog(temperatureLogs);

    return [updatedBreaches, updatedLogs];
  };

  getTemperatureLogsFrom = async (sensorId, timeToCheckFrom) =>
    this.db.getTemperatureLogsFrom(sensorId, timeToCheckFrom);

  getMostRecentBreachLog = async sensorId => this.db.getMostRecentBreachLog(sensorId);

  getMostRecentBreach = async sensorId => this.db.getMostRecentBreach(sensorId);

  getBreachConfigs = async () => this.db.getBreachConfigs();
}

let BreachManagerInstance;

export const getBreachManagerInstance = (dbService, utils) => {
  if (!BreachManagerInstance) {
    BreachManagerInstance = new BreachManager(dbService, utils);
  }
  return BreachManagerInstance;
};

export const destroyBreachManagerInstance = () => {
  BreachManagerInstance = null;
};

export default getBreachManagerInstance;
