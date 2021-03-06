/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2021
 */

/**
 * Helper methods to perform data access functionality for breach calculations
 */
import { VACCINE_ENTITIES } from '../utilities/modules/vaccines/constants';

export class VaccineDataAccess {
  constructor(dbService) {
    this.db = dbService;
  }

  getTemperatureLogsFrom = (sensorId, timeToCheckFrom) =>
    this.db
      .objects(VACCINE_ENTITIES.TEMPERATURE_LOG)
      .filtered('sensor.id == $0 AND timestamp >= $1', sensorId, new Date(timeToCheckFrom))
      .sorted('timestamp');

  getMostRecentBreachLog = sensorId => {
    const allBreachLogs = this.db
      .objects(VACCINE_ENTITIES.TEMPERATURE_LOG)
      .filtered('sensor.id == $0 AND breach != null', sensorId);
    const [mostRecentBreachLog] = allBreachLogs.sorted('timestamp', true);

    return mostRecentBreachLog;
  };

  getMostRecentBreach = sensorId => {
    const allBreaches = this.db
      .objects(VACCINE_ENTITIES.TEMPERATURE_BREACH)
      .filtered('sensor.id == $0', sensorId);
    const [mostRecentBreach] = allBreaches.sorted('startTimestamp', true);

    return mostRecentBreach;
  };

  getBreachConfigs = () => {
    const configs = this.db
      .objects(VACCINE_ENTITIES.TEMPERATURE_BREACH_CONFIGURATION)
      .filtered('type == "HOT_CONSECUTIVE" OR type == "COLD_CONSECUTIVE"');
    return configs;
  };

  getLocations = () => this.db.objects(VACCINE_ENTITIES.LOCATION);

  getSensors = () => this.db.objects(VACCINE_ENTITIES.SENSOR);

  upsertBreaches = breaches => {
    this.db.write(() => {
      breaches.forEach(breach => {
        this.db.update(VACCINE_ENTITIES.TEMPERATURE_BREACH, {
          ...breach,
          id: breach.id,
          startTimestamp: new Date(breach.startTimestamp),
          endTimestamp: breach.endTimestamp ? new Date(breach.endTimestamp) : breach.endTimestamp,
        });
      });
    });
  };

  upsertSensor = sensor =>
    this.db.write(() => {
      this.db.update(VACCINE_ENTITIES.SENSOR, sensor);
    });

  upsertTemperatureLog = temperatureLogs =>
    this.db.write(() => {
      temperatureLogs.forEach(log => {
        this.db.update(VACCINE_ENTITIES.TEMPERATURE_LOG, {
          ...log,
          breach: log.breach ? { id: log.breach.id } : null,
        });
      });
    });
}
