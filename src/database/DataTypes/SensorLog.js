/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class SensorLog extends Realm.Object {
  // TODO
  // Does this need to be a class ??
}

SensorLog.schema = {
  name: 'SensorLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    sensor: 'Sensor',
    location: { type: 'Location', optional: true },
    pointer: 'int',
    timestamp: 'date',
    temperature: 'double',
    logInterval: 'int',
    isInBreach: { type: 'bool', default: false },
    itemBatches: { type: 'list', objectType: 'ItemBatch' },
  },
};

export default SensorLog;
