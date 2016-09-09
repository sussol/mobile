import Realm from 'realm';

export class MasterList extends Realm.Object {
  destructor(database) {
    database.delete('masterListItem', this.items);
  }
  addItem(masterListItem) {
    this.items.push(masterListItem);
  }

  addItemIfUnique(masterListItem) {
    if (this.items.filtered('id == $0', masterListItem.id).length > 0) return;
    this.addItem(masterListItem);
  }
}

MasterList.schema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    note: { type: 'string', optional: true },
    items: { type: 'list', objectType: 'MasterListItem' },
  },
};
