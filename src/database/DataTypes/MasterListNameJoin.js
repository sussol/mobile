import Realm from 'realm';

// Only used for the purpose of cleaning up master lists from names when deleted
export class MasterListNameJoin extends Realm.Object {
  destructor(database) {
    if (!this.name || !this.masterList) return; // Not a full join record

    const indexInMasterLists = this.name.masterLists.findIndex(
      (masterList) => masterList.id === this.masterList.id);

    // If the master list/name aren't actually joined, do nothing
    if (!indexInMasterLists >= 0) return;
    // Remove the master list from the name
    this.name.masterLists.splice(indexInMasterLists, 1);
    database.save('Name', this.name);
  }

  toString() {
    return `Joins master list '${this.masterList.name}' with name '${this.name}'`;
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
