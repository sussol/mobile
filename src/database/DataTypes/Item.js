/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal, millisecondsToDays, MILLISECONDS_PER_DAY } from '../utilities';

// TODO: move USAGE_PERIOD_MILLISECONDS to Item.dailyUsage
const USAGE_PERIOD_MILLISECONDS = 3 * 30 * MILLISECONDS_PER_DAY; // Three months.

/**
 * An item.
 *
 * @property  {string}            id
 * @property  {string}            code
 * @property  {string}            name
 * @property  {number}            defaultPackSize
 * @property  {List.<ItemBatch>}  batches
 * @property  {ItemDepartment}    department
 * @property  {string}            description
 * @property  {ItemCategory}      category
 * @property  {number}            defaultPrice
 * @property  {boolean}           isVisible
 * @property  {Item}              crossReferenceItem
 */
export class Item extends Realm.Object {
  /**
   * Delete all item store joins and item batches associated with this master list.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    // Clean up item store joins referencing deleted item.
    const itemStoreJoins = database.objects('ItemStoreJoin').filtered('itemId == $0', this.id);
    database.delete('ItemStoreJoin', itemStoreJoins);

    // In case of merge-deletion, ensure only delete batches currently associated with this item.
    this.batches = database.objects('ItemBatch').filtered('item.id == $0', this.id);
    database.delete('ItemBatch', this.batches);
  }

  get isVaccine() {
    return !!(this.category && this.category.name === 'Vaccine');
  }

  /**
   * If item is cross-referenced item, return the referenced item, else return this item.
   *
   * @return  {Item}
   */
  get realItem() {
    return this.crossReferenceItem ? this.crossReferenceItem : this;
  }

  /**
   * Get total amount of item.
   *
   * @return  {number}
   */
  get totalQuantity() {
    return getTotal(this.realItem.batches, 'totalQuantity');
  }

  /**
   * Get daily usage of item.
   *
   * @return  {number}
   */
  get dailyUsage() {
    const endDate = new Date();
    const startDate = new Date(endDate - USAGE_PERIOD_MILLISECONDS); // 90 days ago.
    return this.dailyUsageForPeriod(startDate, endDate);
  }

  /**
   * Get the date the item was added, defined as date of he earliest added batch associated
   * with this item, or undefined if no batches exist.
   *
   * @return  {Date}
   */
  get addedDate() {
    if (this.batches.length === 0) return undefined;
    let itemAddedDate = new Date();
    this.batches.forEach(batch => {
      const batchAddedDate = batch.addedDate;
      itemAddedDate = batchAddedDate < itemAddedDate ? batchAddedDate : itemAddedDate;
    });
    return itemAddedDate;
  }

  /**
   * Get the batch associated with this item with the earliest expiration date.
   *
   * @return  {ItemBatch}
   */
  get earliestExpiringBatch() {
    // If no batches associated with this item, return null.
    if (this.batches.length === 0) return null;

    let earliestBatch = this.batches.find(batch => batch.totalQuantity > 0);

    // If no batches found with any items, return null.
    if (!earliestBatch) return null;

    this.batches.forEach(batch => {
      if (
        batch.totalQuantity > 0 &&
        batch.expiryDate &&
        (!earliestBatch.expiryDate || batch.expiryDate < earliestBatch.expiryDate)
      ) {
        earliestBatch = batch;
      }
    });

    return earliestBatch;
  }

  /**
   * Get category of item, or empty string if no category exists.
   *
   * @return  {string}
   */
  get categoryName() {
    return this.category ? this.category.name : '';
  }

  /**
   * Get name of department associated with item, or empty string if no department exists.
   *
   * @return  {string}
   */
  get departmentName() {
    return this.department ? this.department.name : '';
  }

  /**
   * Get batches associated with item that have stock.
   *
   * @return  {List}
   */
  get batchesWithStock() {
    return this.batches.filtered('numberOfPacks > 0');
  }

  /**
   * Get number of batches associated with item that have stock.
   *
   * @return  {number}
   */
  get totalBatchesInStock() {
    return this.batchesWithStock.length;
  }

  /**
   * Get the sum of all transaction batch usage related to batches for this item within a start
   * and end date.
   *
   * @param   {Date}    startDate  Start date.
   * @param   {Date}    endDate    End date.
   * @return  {number}             The total transaction usage for this batch
   *                               over the specified period.
   */
  totalUsageForPeriod(startDate, endDate) {
    return this.batches.reduce(
      (total, batch) => total + batch.totalUsageForPeriod(startDate, endDate),
      0
    );
  }

  /**
   * Get the sum of all transaction batch usage related to batches for this item within a start and
   * end date. If the oldest batch is later than |startDate|, use that.
   *
   * @param   {Date}    startDate  Start date.
   * @param   {Date}    endDate    End date.
   * @return  {number}             The average daily usage for this item over the specified
   *                               period (often a decimal, should be rounded or ceiling taken
   *                               if used as quantity.
   */
  dailyUsageForPeriod(startDate, endDate) {
    if (this.batches.length === 0) return 0;

    const fromDate = this.addedDate > startDate ? this.addedDate : startDate;
    const periodInDays = millisecondsToDays(endDate - fromDate);
    const usage = this.totalUsageForPeriod(fromDate, endDate);

    return usage / (periodInDays || 1); // Avoid divide by zero.
  }

  /**
   * Add batch to item.
   *
   * @param  {ItemBatch}  itemBatch
   */
  addBatch(itemBatch) {
    this.batches.push(itemBatch);
  }

  /**
   * Add batch to item if not already added.
   *
   * @param  {ItemBatch}  itemBatch
   */
  addBatchIfUnique(itemBatch) {
    if (this.batches.filtered('id == $0', itemBatch.id).length > 0) return;
    this.addBatch(itemBatch);
  }

  /**
   * Get string representation of item.
   *
   * @returns  {string}
   */
  toString() {
    return `${this.code} - ${this.name}`;
  }

  /**
   * Finds all this items batches in a specific location.
   * If no location is passed, all of this items ItemBatches
   * are returned.
   * @param {Location} location
   */
  getBatchesInLocation({ id: locationId } = {}) {
    if (!locationId) return this.batchesWithStock;
    return this.batchesWithStock.filtered('location.id = $0', locationId);
  }

  /**
   * Returns the number of batches in a specific location. If
   * no location is passed, finds the number of batches for all
   * batches.
   * @param {Location} location
   */
  getNumberOfBatches(location) {
    return this.getBatchesInLocation(location).length;
  }

  /**
   * Returns the sum of each ItemBatch.totalQuantity in a specific
   * location. If no location is passed, finds the totalQuantity
   * for all batches.
   * @param {Location} location
   */
  getQuantityInLocation(location) {
    return getTotal(this.getBatchesInLocation(location), 'totalQuantity');
  }

  /**
   * Returns all ItemBatches which have been in a breach in a specific
   * location. If no location is passed, all of this items ItemBatches
   * in breaches are returned.
   * @param {Location} location
   */
  getBreachedBatches(location) {
    return this.getBatchesInLocation(location).filter(({ hasBreached }) => hasBreached);
  }

  /**
   * Returns the number of ItemBatches related to this item in breaches
   * for a specific location. If no location is passed, returns all
   * ItemBatches in locations.
   * @param {Location} location
   */
  getHasBreachedBatches(location) {
    return this.getBreachedBatches(location).length > 0;
  }

  /**
   * Returns the sum of all ItemBatches in breaches related to this item.
   * If no location is passed, returns the sum for all ItemBatches related
   * to this item.
   * @param {Location} location
   */
  getQuantityInBreach(location) {
    return getTotal(this.getBreachedBatches(location), 'totalQuantity');
  }

  /**
   * Returns an object {maxTemperature, minTemperature} for all ItemBatches
   * related to this Item in a specific location. If no location is passed,
   * uses all ItemBatches related to this item to find the values.
   * @param {Location} location
   */
  getTemperatureExposure(database, location) {
    let sensorLogs = location ? location.getSensorLogs(database) : database.objects('SensorLog');
    sensorLogs = sensorLogs.filtered(
      'itemBatches.item.id = $0 && itemBatches.numberOfPacks > 0',
      this.id
    );

    if (sensorLogs.length === 0) return { maxTemperature: -Infinity, minTemperature: Infinity };
      
    return {
      maxTemperature: sensorLogs.max('temperature'),
      minTemperature: sensorLogs.min('temperature'),
    };
  }
}

Item.schema = {
  name: 'Item',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: { type: 'string', default: 'placeholderCode' },
    name: { type: 'string', default: 'placeholderName' },
    defaultPackSize: { type: 'double', default: 1 },
    batches: { type: 'list', objectType: 'ItemBatch' },
    department: { type: 'ItemDepartment', optional: true },
    description: { type: 'string', optional: true },
    category: { type: 'ItemCategory', optional: true },
    defaultPrice: { type: 'double', optional: true },
    isVisible: { type: 'bool', default: false },
    crossReferenceItem: { type: 'Item', optional: true },
    doses: { type: 'int', optional: true },
  },
};

export default Item;
