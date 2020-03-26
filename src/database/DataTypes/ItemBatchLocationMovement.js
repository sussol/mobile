/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class ItemBatchLocationMovement extends Realm.Object {}

ItemBatchLocationMovement.schema = {
  name: 'ItemBatchLocationMovement',
  primaryKey: 'id',
  properties: {
    id: 'string',
    location: { type: 'Location' },
    itemBatch: { type: 'ItemBatch' },
    enterDate: { type: 'date' },
    exitDate: { type: 'date', optional: true },
  },
};

export default ItemBatchLocationMovement;
