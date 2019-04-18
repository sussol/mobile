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
    sensor: { type: 'Sensor', optional: true },
    location: { type: 'Location', optional: true },
    pointer: { type: 'int', optional: true },
    timestamp: 'date',
    temperature: 'double',
    logInterval: { type: 'int', optional: true },
    isInBreach: { type: 'bool', default: false },
    itemBatches: { type: 'list', objectType: 'ItemBatch' },
  },
};

export default SensorLog;
