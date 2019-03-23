/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

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

  /**
   * Find the current stores matching store tag object in this master lists program settings
   * @param  {string}  tags   Current stores tags field
   * @return {object} The matching storeTag programsettings field for the current store
   */
  getStoreTagObject(tags) {
    const storeTags = tags.split(/[\s,]+/);
    return Object.entries(JSON.parse(this.programSettings).storeTags).reduce(
      ([programStoreTag, storeTagObject]) => {
        if (!(storeTags.indexOf(programStoreTag) >= 0)) return null;
        return storeTagObject;
      }
    );
  }

  /**
   * Find if this master list is a program useable by the current store
   * @param  {string}  tags   Current stores tags field
   * @return {bool} true if the current store can use this master list
   */
  canUseProgram(tags) {
    return !!this.getStoreTagObject(tags);
  }

  /**
   * Find a specifically named order type in the store tag object for this store and masterlist
   * @param  {string}  tags            Current stores tags field
   * @param  {string}  orderTypeName   Name of the orderType to search for
   * @return {object} The matching orderType object
   */
  getOrderType(tags, orderTypeName) {
    this.getStoreTagObject(tags).orderTypes.reduce(orderType => {
      if (!(orderType.name === orderTypeName)) return null;
      return orderType;
    });
  }
}

export default MasterList;

MasterList.schema = {
  name: 'MasterList',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    note: { type: 'string', optional: true },
    items: { type: 'list', objectType: 'MasterListItem' },
    programSettings: { type: 'string', optional: true },
    isProgram: { type: 'bool', optional: true },
  },
};
