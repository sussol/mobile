import Realm from 'realm';

export class MasterListItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
}

MasterListItem.schema = {
  name: 'MasterListItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: 'MasterList',
    item: 'Item',
    imprestQuantity: { type: 'double', optional: true },
  },
};
