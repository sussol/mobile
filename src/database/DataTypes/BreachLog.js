/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class BreachLog extends Realm.Object {}

BreachLog.schema = {
  name: 'BreachLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperatureLogs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'breach' },
    startTimestamp: 'date',
    endTimestamp: { type: 'date', optional: true },
  },
};

export default BreachLog;
