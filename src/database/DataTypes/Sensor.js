/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Sensor extends Realm.Object {
  // TODO
  // Does this need to be a class ??
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
