/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class LocationMovement extends Realm.Object {}

LocationMovement.schema = {
  name: 'LocationMovement',
  primaryKey: 'id',
  properties: {
    id: 'string',
    location: { type: 'Location' },
    itemBatch: { type: 'ItemBatch' },
    enterDate: { type: 'date', default: new Date() },
    exitDate: { type: 'date', optional: true },
  },
};

export default LocationMovement;
