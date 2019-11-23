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
 * @property  {string}                 programSettings *See below for example
 * @property  {boolean}                isProgram
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
   * Returns this master lists programSettings, which is stored
   * as a stringified object as an object
   */
  get parsedProgramSettings() {
    return this.programSettings && JSON.parse(this.programSettings);
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

  /**
   * Find the current stores matching store tag object in this master lists program settings.
   * Program settings is a JSON object held as a string - example below.
   * @param  {string}  tags   Current stores tags field
   * @return {object} The matching storeTag programsettings field for the current store
   */
  getStoreTagObject(tags) {
    const thisStoresTags = tags && tags.split(/[\s,]+/);
    const storeTags = this.parsedProgramSettings && this.parsedProgramSettings.storeTags;

    if (!(thisStoresTags && storeTags)) return null;

    const foundStoreTag = Object.keys(storeTags).find(
      storeTag => thisStoresTags.indexOf(storeTag) >= 0
    );

    return foundStoreTag && storeTags[foundStoreTag];
  }

  toString() {
    return this.name;
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
    programSettings: { type: 'string', optional: true },
    isProgram: { type: 'bool', optional: true },
  },
};

export default MasterList;

/**
 * programSettings example
 *
 * programSettings: {
 *  elmisCode: "CHR-1000",
 *  storeTags: {
 *    CHR1000: {
 *      periodScheduleName: "Period Schedule 1"
 *      orderTypes: [{
 *        name: "normal",
 *        type: "emergency",
 *        maxOrdersPerPeriod: 1,
 *        maxMOS: 2,
 *        threshodMOS: 1,
 *      }]
 *    }
 *  }
 * }
 *
 */
