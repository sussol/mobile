/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';

export class ItemDirection extends Realm.Object {}

ItemDirection.schema = {
  name: 'ItemDirection',
  primaryKey: 'id',
  properties: {
    id: 'string',
    priority: 'string',
    directions: 'string',
    item: { type: 'Item', optional: true },
  },
};
