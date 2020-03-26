/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class RawSensorLog extends Realm.Object {}

RawSensorLog.schema = {
  name: 'RawSensorLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperature: 'double',
    timestamp: 'date',
    sensor: 'Sensor',
  },
};

export default RawSensorLog;
