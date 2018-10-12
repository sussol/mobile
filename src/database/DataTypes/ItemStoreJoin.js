import Realm from 'realm';

// Only used for the purpose of cleaning up item visibility when deleted
export class ItemStoreJoin extends Realm.Object {
  destructor(database) {
    if (!this.joinsThisStore) return; // Don't need to change visibility if record not this store
    const itemResults = database.objects('Item').filtered('id == $0', this.itemId);
    if (!itemResults || itemResults.length <= 0) return; // Doesn't join an item in this database
    // Make the item no longer visible in this store
    const item = itemResults[0];
    item.isVisible = false;
    database.save('Item', item);
  }

  toString() {
    return `Joins item ${this.itemId} with ${this.joinsThisStore ? 'this' : 'another'} store`;
  }
}

// ItemStoreJoin never used internally, only held for sync delete functionality
ItemStoreJoin.schema = {
  name: 'ItemStoreJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemId: 'string',
    joinsThisStore: 'bool',
    locationType: { type: 'LocationType', default: null },
  },
};
