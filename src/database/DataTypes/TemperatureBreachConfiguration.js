/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class TemperatureBreachConfiguration extends Realm.Object {
  toJSON() {
    return {
      id: this.id,
      minimumTemperature: this.minimumTemperature,
      maximumTemperature: this.maximumTemperature,
      duration: this.duration,
      description: this.description,
      colour: this.colour,
      locationID: this.location?.id ?? '',
      type: this.type,
    };
  }
}

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
    location: { type: 'Location', optional: true },
    type: 'string',
  },
};

export default TemperatureBreachConfiguration;
