/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class Sensor extends Realm.Object {}

Sensor.schema = {
  name: 'Sensor',
  primaryKey: 'id',
  properties: {
    id: 'string',
    macAddress: { type: 'string', optional: true },
    name: { type: 'string', optional: true },
    batteryLevel: { type: 'double', default: 0 },
    rawSensorLogs: { type: 'linkingObjects', objectType: 'RawSensorLog', property: 'sensor' },
  },
};

export default Sensor;
