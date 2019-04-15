/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A master list of items.
 *
 * @property  {string}                 id
 * @property  {string}                 name
 * @property  {string}                 note
 * @property  {List.<MasterListItem>}  items
 *
 */
export class MasterList extends Realm.Object {
  /**
   * Delete all items associated with removed master list.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    database.delete('masterListItem', this.items);
  }

  /**
   * Add an item to this master list.
   *
   * @param  {MasterListItem}  masterListItem
   */
  addItem(masterListItem) {
    this.items.push(masterListItem);
  }

  /**
   * Add an item to this master list, if it has not already been added.
   *
   * @param  {MasterListItem}  masterListItem
   */
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

export default MasterList;
