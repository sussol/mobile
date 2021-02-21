/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';
import moment from 'moment';
import { createRecord } from '../utilities';

export class TemperatureBreachConfiguration extends Realm.Object {
  /**
   * With the provided temperatureLog, determines if the passed location
   * was in a breach at the time of the temperature log and if so, will
   * create a temperature breach record. Also adds to each of the temperature
   * logs which are currently part of that breach, the related breach
   * record.
   *
   * A breach has a duration and minimum and maximum temperatures defined by this
   * configuration - for example above 8 degrees for 2 hours. To determine if a
   * location has currently been breached, look back from the temperature logs
   * timestamp the duration of this configuration and determine if every temperature
   * log since that time has been outside of the threshold.
   *
   * @param {Realm}          database App-wide database interface
   * @param {Location}       location A Location record to create a breach for.
   * @param {TemperatureLog} temperatureLog A potential log which may create a breach.
   */
  createBreach(database, location, temperatureLog) {
    const { timestamp, sensor } = temperatureLog;
    const { temperatureLogs } = location;

    // The potential start time of the breach - looking back from the passed
    // temperature log to the pre-configured minimum duration of a breach.
    const startTime = moment(timestamp).subtract(this.duration, 'ms').toDate();

    // Find all of the temperature logs since the possible start time of the
    // breach.
    const proximalLogs = temperatureLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      startTime,
      timestamp
    );

    // Ensure the duration of the temporally proximal temperature logs is
    // greater than the duration required for a breach.
    const mostRecentTimestamp = moment(proximalLogs.max('timestamp'));
    const leastRecentTimestamp = moment(proximalLogs.min('timestamp'));
    const isDurationLongEnough =
      mostRecentTimestamp.diff(leastRecentTimestamp, 'ms') >= this.duration;

    // If the duration of logs is sufficiently long enough, also ensure each temperature
    // log exceeds the threshold required for a breach
    const logInBreachRange = ({ temperature: logTemperature }) =>
      logTemperature >= this.minimumTemperature && logTemperature <= this.maximumTemperature;

    const willCreateBreach = isDurationLongEnough && proximalLogs.every(logInBreachRange);

    // Create a breach if the duration of logs and temperatures define a breach and set
    // each temperature log as part of the breach.
    if (willCreateBreach) {
      const breach = createRecord(database, 'TemperatureBreach', startTime, location, sensor, this);
      proximalLogs.forEach(log => database.update('TemperatureLog', { ...log, breach }));
    }

    return willCreateBreach;
  }

  toJSON() {
    return {
      id: this.id,
      minimumTemperature: this.minimumTemperature,
      maximumTemperature: this.maximumTemperature,
      duration: this.duration,
      description: this.description,
      colour: this.colour,
      locationID: this.location?.id ?? '',
      type: this.type,
    };
  }
}

TemperatureBreachConfiguration.schema = {
  name: 'TemperatureBreachConfiguration',
  primaryKey: 'id',
  properties: {
    id: 'string',
    minimumTemperature: { type: 'double', optional: true },
    maximumTemperature: { type: 'double', optional: true },
    duration: { type: 'double', optional: true },
    description: { type: 'string', optional: true },
    colour: { type: 'string', optional: true },
    location: { type: 'Location', optional: true },
    type: 'string',
  },
};

export default TemperatureBreachConfiguration;
