/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

// Only used to clean up name visibility upon deletion.
export class NameStoreJoin extends Realm.Object {
  destructor(database) {
    if (!this.joinsThisStore) return; // Unnecessary to change visibility if record not this store.
    const nameResults = database.objects('Name').filtered('id == $0', this.nameId);
    if (!nameResults || nameResults.length <= 0) return; // Does not join a name in this database.
    // Update name to no longer be visible in this store.
    const name = nameResults[0];
    name.isVisible = false;
    database.save('Name', name);
  }

  toString() {
    return `Joins name ${this.nameId} with ${this.joinsThisStore ? 'this' : 'another'} store`;
  }
}

export default NameStoreJoin;

// NameStoreJoin never used internally, only held for sync delete functionality.
NameStoreJoin.schema = {
  name: 'NameStoreJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    nameId: 'string',
    joinsThisStore: 'bool',
  },
};
