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
    masterList: { type: 'MasterList', optional: true },
    // masterListNameJoinID only used in list_local_line sync
    masterListNameJoinId: { type: 'string', optional: true },
    item: 'Item',
    imprestQuantity: { type: 'double', optional: true },
  },
};
