/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Sensor extends Realm.Object {
  get toString() {
    return `MAC: ${this.macAddress} TEMP: ${this.temperature}`;
  }

  get latestAggregatedLog() {
    const aggregatedLogs = this.sensorLogs.filtered('aggregation != null && aggregation != ""');
    if (aggregatedLogs.length === 0) return null;
    const latestTimestamp = aggregatedLogs.max('timestamp');
    return aggregatedLogs.filtered('timestamp == $0', latestTimestamp)[0];
  }

  get latestTemperature() {
    const { latestAggregatedLog } = this;
    if (latestAggregatedLog === null) return null;
    return latestAggregatedLog.temperature;
  }

  get isInBreach() {
    const { latestAggregatedLog } = this;
    if (latestAggregatedLog === null) return false;
    return latestAggregatedLog.isInBreach;
  }
}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    location: { type: 'Location', optional: true },
    name: { type: 'string', optional: true },
    macAddress: { type: 'string', optional: true },
    batteryLevel: { type: 'double', optional: true },
    logInterval: { type: 'int', optional: true },
    numberOfLogs: { type: 'int', optional: true },
    temperature: { type: 'double', optional: true },
    lastConnectionTimestamp: { type: 'date', optional: true },
    sensorLogs: { type: 'list', objectType: 'SensorLog' },
  },
};

export default Sensor;
