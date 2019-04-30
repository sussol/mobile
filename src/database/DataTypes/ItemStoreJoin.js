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
   * Delete item to store join and update visibility of items in current store.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Check if join is associated with this store. If not, nothing to be done.
    if (!this.joinsThisStore) return;

    // Check if join is associated with item in this database. If not, nothing
    // to be done.
    const itemResults = database.objects('Item').filtered('id == $0', this.itemId);
    if (!itemResults || itemResults.length <= 0) return;

    // Join is associate with this store and item exists in this database. update
    // item to no longer be visible in this store.
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
  },
};

export default ItemStoreJoin;
