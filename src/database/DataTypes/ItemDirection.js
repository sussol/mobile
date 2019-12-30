/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';

export class ItemDirection extends Realm.Object {
  /**
   * Returns the matching expansion of this ItemDirection, defaulting
   * to null for all falsey values.
   */
  getExpansion = database => {
    const expansion = database.get('Abbreviation', this.directions, 'abbreviation')?.expansion;
    return expansion || null;
  };
}

ItemDirection.schema = {
  name: 'ItemDirection',
  primaryKey: 'id',
  properties: {
    id: 'string',
    priority: 'int',
    directions: 'string',
    item: { type: 'Item', optional: true },
  },
};
