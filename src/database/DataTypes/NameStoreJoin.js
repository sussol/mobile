/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A name to store join used as a helper for sync deletion functionality.
 *
 * @property  {string}   id
 * @property  {string}   nameId
 * @property  {boolean}  joinsThisStore
 */
export class NameStoreJoin extends Realm.Object {
  /**
   * Maintain item visibility consistency with delete records synced from server.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // If record does not join this store, do nothing.
    if (!this.joinsThisStore) return;

    const nameResults = database.objects('Name').filtered('id == $0', this.nameId);

    // If record does oes not join a name in this database, do nothing.
    if (!nameResults || nameResults.length <= 0) return;

    // Record joins store with name in database, update name to no longer be visible in this store.
    const name = nameResults[0];
    name.isVisible = false;
    database.save('Name', name);
  }

  /**
   * Get string representation of name to store join.
   */
  toString() {
    return `Joins name ${this.nameId} with ${this.joinsThisStore ? 'this' : 'another'} store`;
  }
}

NameStoreJoin.schema = {
  name: 'NameStoreJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    nameId: 'string',
    joinsThisStore: 'bool',
  },
};

export default NameStoreJoin;
