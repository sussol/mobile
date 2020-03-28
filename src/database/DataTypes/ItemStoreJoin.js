/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * An item to store join used as a helper for sync deletion functionality.
 *
 * @property  {string}   id
 * @property  {string}   itemId
 * @property  {boolean}  joinsThisStore
 */

export class ItemStoreJoin extends Realm.Object {
  /**
   * Make the related item to this join invisible on deletion.
   * @param  {Realm}  database
   */
  destructor(database) {
    if (!this.joinsThisStore) return;
    const itemResults = database.objects('Item').filtered('id == $0', this.itemId);
    if (!itemResults || itemResults.length <= 0) return;

    const item = itemResults[0];
    item.isVisible = false;
    database.save('Item', item);
  }

  /**
   * Get string representation of item store join.
   *
   * @returns  {string}
   */
  toString() {
    return `Joins item ${this.itemId} with ${this.joinsThisStore ? 'this' : 'another'} store`;
  }
}

ItemStoreJoin.schema = {
  name: 'ItemStoreJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemId: 'string',
    joinsThisStore: 'bool',
    restrictedLocationType: { type: 'LocationType', optional: true },
  },
};

export default ItemStoreJoin;
