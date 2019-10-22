/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal, millisecondsToDays } from '../utilities';

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
   * Returns an indicator if this item has stock on hand, or not.
   *
   * @return {number}
   */
  get hasStock() {
    return this.totalQuantity > 0;
  }

  /**
   * Get daily usage of item.
   *
   * @return  {number}
   */
  get dailyUsage() {
    const { AMCmillisecondsLookBack, AMCenforceLookBack } = global;
    const endDate = new Date();
    const startDate = new Date(endDate - AMCmillisecondsLookBack);
    return this.dailyUsageForPeriod(startDate, endDate, AMCenforceLookBack);
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
   * @return {Number} this items monthly usage based on a 30 day month.
   */
  get monthlyUsage() {
    return this.dailyUsage * 30;
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
   * Returns a string representing the units for this item.
   * @return {string} the unit for this item, or N/A if none has been assigned.
   */
  get unitString() {
    return (this.unit && this.unit.units) || 'N/A';
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
  dailyUsageForPeriod(startDate, endDate, enforceEndDate = false) {
    if (this.batches.length === 0) return 0;

    let fromDate = startDate;
    if (!enforceEndDate) {
      const { addedDate } = this;
      fromDate = addedDate > startDate ? addedDate : fromDate;
    }
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
    defaultPrice: { type: 'double', default: 0 },
    isVisible: { type: 'bool', default: false },
    crossReferenceItem: { type: 'Item', optional: true },
    unit: { type: 'Unit', optional: true },
  },
};

export default Item;
