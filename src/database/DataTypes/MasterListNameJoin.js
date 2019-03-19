/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A master list to name join used as a helper for sync deletion functionality.
 *
 * @property  {string}      id
 * @property  {MasterList}  masterList
 * @property  {Name}        name
 */
export class MasterListNameJoin extends Realm.Object {
  /**
   * Delete master list to name join and any name references to removed master lists.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Not a full join record, do nothing.
    if (!this.name || !this.masterList) return;

    const indexInMasterLists = this.name.masterLists.findIndex(
      masterList => masterList.id === this.masterList.id
    );

    // If the master list and name are not joined, do nothing.
    if (!indexInMasterLists >= 0) return;

    // Remove the master list from the name.
    this.name.masterLists.splice(indexInMasterLists, 1);
    database.save('Name', this.name);
  }

  /**
   * Get string representation of master list to name join.
   */
  toString() {
    return `Joins master list '${this.masterList.name}' with name '${this.name}'`;
  }
}

MasterListNameJoin.schema = {
  name: 'MasterListNameJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: { type: 'MasterList', optional: true },
    name: { type: 'Name', optional: true },
  },
};

export default MasterListNameJoin;
