import Realm from 'realm';

// Only used for the purpose of cleaning up master lists from names when deleted
export class MasterListNameJoin extends Realm.Object {
  destructor(database) {
    if (!this.name || !this.masterList) return; // Not a full join record
    // If the master list/name aren't actually joined, do nothing
    if (!this.name.masterList || this.name.masterList.id !== this.masterList.id) return;
    // Remove the master list from the name
    this.name.masterList = null;
    database.save('Name', this.name);
  }

  toString() {
    return `Joins master list ${this.masterListId} with name ${this.nameId}`;
  }
}

// MasterListNameJoin never used internally, only held for sync delete functionality
MasterListNameJoin.schema = {
  name: 'MasterListNameJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: { type: 'MasterList', optional: true },
    name: { type: 'Name', optional: true },
  },
};
