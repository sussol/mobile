/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class LocationType extends Realm.Object {}

LocationType.schema = {
  name: 'LocationType',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', optional: true },
    comment: { type: 'string', optional: true },
  },
};

export default LocationType;
