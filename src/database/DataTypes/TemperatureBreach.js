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
    startTimestamp: 'date',
    endTimestamp: { type: 'date', optional: true },
    location: 'Location',
  },
};

export default TemperatureBreach;
