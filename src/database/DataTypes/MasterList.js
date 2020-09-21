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
   * Get all indicators currently active on this master list.
   * @returns {Array.<ProgramIndicator>}
   */
  get activeIndicators() {
    return this.indicators.filtered('isActive == true');
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
   * Add an indicator to this master list.
   *
   * @param {ProgramIndicator} programIndicator
   */
  addIndicator(programIndicator) {
    this.indicators.push(programIndicator);
  }

  /**
   * Add an indicator to this master list, if it has not already been added.
   *
   * @param {ProgramIndicator} programIndicator
   */
  addIndicatorIfUnique(programIndicator) {
    if (this.indicators.filtered('id == $0', programIndicator.id).length > 0) return;
    this.addIndicator(programIndicator);
  }

  /**
   * Find the current stores matching store tag object in this master lists program settings.
   * Program settings is a JSON object held as a string - example below.
   * @param  {string}  tags   Current stores tags field
   * @return {object} The matching storeTag programsettings field for the current store
   */
  getStoreTagObject(tags) {
    const storeTags = this.parsedProgramSettings && this.parsedProgramSettings.storeTags;

    if (!(tags && tags.length && storeTags)) return null;

    const foundStoreTag = Object.keys(storeTags).find(
      storeTag => tags.indexOf(storeTag.toLowerCase()) >= 0
    );

    return foundStoreTag && storeTags[foundStoreTag];
  }

  /**
   * Returns an array of order type objects for this program, for the
   * current store.
   *
   * @param  {String}  tags   Current stores tags field
   * @return {Array} An array of order types for this program/store.
   */
  getOrderTypes(tags) {
    const storeTagObject = this.getStoreTagObject(tags);
    return storeTagObject?.orderTypes;
  }

  /**
   * Returns a specific order type object which matches the name provided.
   *
   * @param   {String} orderTypeToFind
   * @param   {String} tags
   * @returns {Object} An order type object
   */
  getOrderType(orderTypeName, tags) {
    const orderTypes = this.getOrderTypes(tags);
    if (!orderTypes) return null;

    return orderTypes.find(orderType => orderType.name === orderTypeName);
  }

  /**
   * Returns the maximum number of lines for the provided order type.
   *
   * @param   {String} orderTypeName
   * @param   {String} tags
   * @returns {Number} The maximum number of lines an order can have with the supplied order type
   */
  getMaxLines(orderTypeName, tags) {
    const orderType = this.getOrderType(orderTypeName, tags);
    const maxLinesForOrder = orderType?.maxEmergencyOrders;
    return maxLinesForOrder || Infinity;
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
    indicators: { type: 'list', objectType: 'ProgramIndicator' },
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
