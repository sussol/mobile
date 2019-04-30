/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class LocationType extends Realm.Object {
  // TODO
  // Does this need to be a class ??
}

LocationType.schema = {
  name: 'LocationType',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', optional: true },
    minTemperature: { type: 'double', default: 2 },
    maxTemperature: { type: 'double', default: 8 },
    customData: { type: 'string', optional: true },
  },
};

export default LocationType;
