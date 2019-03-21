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

  getStoreTagObject(tags) {
    const storeTags = tags.split(/[\s,]+/);
    return Object.keys(JSON.parse(this.programSettings)).filter(
      programsStoreTags => storeTags.indexOf(programsStoreTags) >= 0
    )[0];
  }

  canUseProgram(tags) {
    return !!this.getStoreTagObject(tags);
  }

  getOrderTypes(tags) {
    const storeTags = tags.split(/[\s,]+/);
    return Object.entries(JSON.parse(this.programSettings).storeTags).reduce(
      ([programsStoreTags, value]) => {
        if (!(storeTags.indexOf(programsStoreTags) >= 0)) return null;
        return value.orderTypes;
      }
    );
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
