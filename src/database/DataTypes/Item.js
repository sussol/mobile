/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal, millisecondsToDays, MILLISECONDS_PER_DAY } from '../utilities';

const USAGE_PERIOD_MILLISECONDS = 3 * 30 * MILLISECONDS_PER_DAY; // Three months.

export class Item extends Realm.Object {
  destructor(database) {
    // Clean up item store joins referencing deleted item.
    const itemStoreJoins = database.objects('ItemStoreJoin').filtered('itemId == $0', this.id);
    database.delete('ItemStoreJoin', itemStoreJoins);

    // In case of merge-deletion, ensure only delete batches currently associated with this item.
    this.batches = database.objects('ItemBatch').filtered('item.id == $0', this.id);
    database.delete('ItemBatch', this.batches);
  }

  /**
   * A getter for cross-reference items. Returns the referenced item.
   */
  get realItem() {
    return this.crossReferenceItem ? this.crossReferenceItem : this;
  }

  get totalQuantity() {
    return getTotal(this.realItem.batches, 'totalQuantity');
  }

  get dailyUsage() {
    const endDate = new Date();
    const startDate = new Date(endDate - USAGE_PERIOD_MILLISECONDS); // 90 days ago.
    return this.dailyUsageForPeriod(startDate, endDate);
  }

  // Returns the earliest added batch associated with this item. Will return
  // undefined if there are no batches.
  get addedDate() {
    if (this.batches.length === 0) return undefined;
    let itemAddedDate = new Date();
    this.batches.forEach(batch => {
      const batchAddedDate = batch.addedDate;
      itemAddedDate = batchAddedDate < itemAddedDate ? batchAddedDate : itemAddedDate;
    });
    return itemAddedDate;
  }

  get earliestExpiringBatch() {
    // If no batches associated with this item, return null.
    if (this.batches.length === 0) return null;

    let earliestBatch = this.batches.find(batch => batch.totalQuantity > 0);

    // If no batches found with |totalQuantity > 0|, return null.
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

  get categoryName() {
    return this.category ? this.category.name : '';
  }

  get departmentName() {
    return this.department ? this.department.name : '';
  }

  get batchesWithStock() {
    return this.batches.filtered('numberOfPacks > 0');
  }

  get totalBatchesInStock() {
    return this.batchesWithStock.length;
  }

  /**
   * Get the sum of all transaction batch usage related to batches for
   * this item within a start and end date.
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
   * Get the sum of all transaction batch usage related to batches for this
   * item within a start and end date. If the oldest batch is later than
   * |startDate|, use that.
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

  addBatch(itemBatch) {
    this.batches.push(itemBatch);
  }

  addBatchIfUnique(itemBatch) {
    if (this.batches.filtered('id == $0', itemBatch.id).length > 0) return;
    this.addBatch(itemBatch);
  }

  toString() {
    return `${this.code} - ${this.name}`;
  }
}

export default Item;

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
  },
};
