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
   * Program settings is a JSON object from 4D, which requires two parses.
   * @param  {string}  tags   Current stores tags field
   * @return {object} The matching storeTag programsettings field for the current store
   */
  getStoreTagObject(tags) {
    if (!this.programSettings) return null;
    const storeTags = tags.split(/[\s,]+/);
    const firstParse = JSON.parse(this.programSettings);
    if (!firstParse) return null;

    return Object.entries(JSON.parse(firstParse).storeTags).filter(
      ([programStoreTag]) => storeTags.indexOf(programStoreTag) >= 0
    )[0][1];
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
   * Find a specifically named order type in the store tag object for this store
   * and masterlist.
   *
   * @param  {string}  tags            Current stores tags field
   * @param  {string}  orderTypeName   Name of the orderType to search for
   * @return {object} The matching orderType object
   */
  getOrderType(tags, orderTypeName) {
    return this.getStoreTagObject(tags).orderTypes.filter(
      orderType => orderType.name === orderTypeName
    )[0];
  }

  get parsedProgramSettings() {
    if (!this.programSettings) return null;
    const firstParse = JSON.parse(this.programSettings);
    if (!firstParse) return null;
    return JSON.parse(firstParse);
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
