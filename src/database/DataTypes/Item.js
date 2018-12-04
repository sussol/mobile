import Realm from 'realm';
import { getTotal, millisecondsToDays, MILLISECONDS_PER_DAY } from '../utilities';

const USAGE_PERIOD_MILLISECONDS = 3 * 30 * MILLISECONDS_PER_DAY; // Three months in milliseconds

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
   * A useful getter to ensure that if the item is a cross reference item,
   * we use the item it references (the real item) rather than the cross
   * reference item
   */
  get realItem() {
    return this.crossReferenceItem ? this.crossReferenceItem : this;
  }

  get totalQuantity() {
    return getTotal(this.realItem.batches, 'totalQuantity');
  }

  get dailyUsage() {
    const endDate = new Date();
    const startDate = new Date(endDate - USAGE_PERIOD_MILLISECONDS); // 90 Days ago
    return this.dailyUsageForPeriod(startDate, endDate);
  }

  // Based on the earliest added ItemBatch associated with this Item
  // Will return undefined if there are no batches.
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
    if (this.batches.length === 0) return null;
    let earliestBatch = this.batches.find(batch => batch.totalQuantity > 0);
    // If no batches found with totalQuantity > 0, return null
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
   * Returns the sum of all usage in TransactionBatches related to ItemBatches for
   * this Item within period defined by a starting and ending date.
   * @param   {Date} startDate  Starting Date (e.g. From 25/4/2017)
   * @param   {Date} endDate    Starting Date (e.g. to 25/7/2017)
   * @return  {number}          The total transaction usage for this batch
   */
  totalUsageForPeriod(startDate, endDate) {
    return this.batches.reduce(
      (total, batch) => total + batch.totalUsageForPeriod(startDate, endDate),
      0
    );
  }

  /**
   * Returns the sum of all usage in TransactionBatches related to ItemBatches for
   * this Item within period defined by a starting and ending date. If the oldest
   * TransactionBatch is later than the startDate, then that will be used instead
   * @param   {Date} startDate  Starting Date (e.g. From 25/4/2017)
   * @param   {Date} endDate    Starting Date (e.g. to 25/7/2017)
   * @return  {number}          The average daily usage over period for this item. Note: LIKELY A
   *                            DECIMAL. Avoid use in quantities without rounding (or ceiling).
   */
  dailyUsageForPeriod(startDate, endDate) {
    if (this.batches.length === 0) return 0;
    const addedDate = this.addedDate;
    const fromDate = addedDate > startDate ? addedDate : startDate;
    const periodInDays = millisecondsToDays(endDate - fromDate);
    const usage = this.totalUsageForPeriod(fromDate, endDate);
    return usage / (periodInDays || 1); // Avoid divide by zero
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
