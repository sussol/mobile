/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class MasterListItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
}

export default MasterListItem;

MasterListItem.schema = {
  name: 'MasterListItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    masterList: { type: 'MasterList', optional: true },
    item: { type: 'Item', optional: true },
    imprestQuantity: { type: 'double', optional: true },
  },
};
