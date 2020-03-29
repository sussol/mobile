/**
 * Sustainable Solutions (NZ) Ltd. 2020
 * mSupply Mobile
 */

import Realm from 'realm';

export class TemperatureBreach extends Realm.Object {}

TemperatureBreach.schema = {
  name: 'TemperatureBreach',
  primaryKey: 'id',
  properties: {
    id: 'string',
    temperatureLogs: { type: 'linkingObjects', objectType: 'TemperatureLog', property: 'breach' },
    startTimestamp: { type: 'date', optional: true },
    endTimestamp: { type: 'date', optional: true },
    location: { type: 'Location', optional: true },
  },
};

export default TemperatureBreach;
