/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class SensorLog extends Realm.Object {}

SensorLog.schema = {
  name: 'SensorLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperature: 'double',
    timestamp: 'date',
    sensor: 'Sensor',
    location: { type: 'Location', optional: true },
  },
};

export default SensorLog;
