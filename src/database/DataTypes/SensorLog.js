/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class SensorLog extends Realm.Object {}

SensorLog.schema = {
  name: 'SensorLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    sensor: 'Sensor',
    location: { type: 'Location', optional: true },
    timestamp: { type: 'date', optional: true },
    temperature: 'double',
    isInBreach: { type: 'bool', default: false },
    aggregation: { type: 'string', default: '' },
    itemBatches: { type: 'list', objectType: 'ItemBatch' },
  },
};

export default SensorLog;
