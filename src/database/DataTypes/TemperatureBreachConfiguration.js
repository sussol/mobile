/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class TemperatureBreachConfiguration extends Realm.Object {}

TemperatureBreachConfiguration.schema = {
  name: 'TemperatureBreachConfiguration',
  primaryKey: 'id',
  properties: {
    id: 'string',
    minimumTemperature: { type: 'double', optional: true },
    maximumTemperature: { type: 'double', optional: true },
    duration: { type: 'double', optional: true },
    description: { type: 'string', optional: true },
    colour: { type: 'string', optional: true },
  },
};

export default TemperatureBreachConfiguration;
