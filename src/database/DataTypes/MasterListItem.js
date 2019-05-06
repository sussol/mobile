/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * An item associated with a master list.
 *
 * @property  {string}      id
 * @property  {masterList}  masterList
 * @property  {Item}        item
 * @property  {number}      imprestQuantity
 */
export class MasterListItem extends Realm.Object {
  /**
   * Get id of the item associated with this master list item.
   *
   * @return  {string}
   */
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
    item: { type: 'Item', optional: true },
    imprestQuantity: { type: 'double', optional: true },
    price: { type: 'double', default: 0 },
  },
};

export default MasterListItem;
