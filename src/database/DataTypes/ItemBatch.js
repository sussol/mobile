import Realm from 'realm';

import { getTotal } from '../utilities';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const USAGE_PERIOD_MILLISECONDS = 3 * 30 * MILLISECONDS_PER_DAY; // Three months in milliseconds


export class ItemBatch extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  // Return the date this batch was added, assuming that was in the earliest transaction batch
  // connected to this item batch
  get addedDate() {
    return this.transactionBatches.reduce((oldestConfirmDate, transactionBatch) => {
      const confirmDate = transactionBatch.transaction.confirmDate;
      if (!confirmDate || oldestConfirmDate < confirmDate) return oldestConfirmDate;
      return confirmDate;
    }, new Date());
  }

  // Gets the usage per day for this batch since either the date it was added to stock, or
  // the usage calculation period of three months, whatever is shorter
  get dailyUsage() {
    // Get all transaction batches confirmed in the last three months
    const sinceDate = new Date();
    sinceDate.setTime(sinceDate.getTime() - USAGE_PERIOD_MILLISECONDS);
    const transactionBatches = this.transactionBatches
                                   .filtered('transaction.confirmDate >= $0', sinceDate);

    // Get the total usage over that period
    const totalUsage = getTotal(transactionBatches, 'usage');

    // Calculate and return the daily usage over either the usage period, or since this batch was
    // added if that is shorter
    const currentDate = new Date();
    const timeSinceAdded = currentDate.getTime() - this.addedDate.getTime();
    const usagePeriod = Math.min(toDays(USAGE_PERIOD_MILLISECONDS), toDays(timeSinceAdded));
    const dailyUsage = usagePeriod ? totalUsage / usagePeriod : 0;
    return dailyUsage;
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  set totalQuantity(quantity) {
    if (quantity < 0) throw new Error('Cannot set a negative item batch quantity');
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  addTransactionBatch(transactionBatch) {
    this.transactionBatches.push(transactionBatch);
  }

  addTransactionIfUnique(transactionBatch) {
    if (this.transactionBatches.filtered('id == $0', transactionBatch.id).length > 0) return;
    this.addTransactionBatch(transactionBatch);
  }

  toString() {
    return `${this.itemName} - Batch ${this.batch}`;
  }
}

function toDays(milliseconds) {
  return Math.ceil(milliseconds / MILLISECONDS_PER_DAY); // Round up to the nearest day
}

ItemBatch.schema = {
  name: 'ItemBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: { type: 'Item', optional: true },
    packSize: 'double',
    numberOfPacks: 'double',
    expiryDate: { type: 'date', optional: true },
    batch: { type: 'string', default: '' },
    costPrice: 'double',
    sellPrice: 'double',
    supplier: { type: 'Name', optional: true },
    transactionBatches: { type: 'list', objectType: 'TransactionBatch' },
  },
};
