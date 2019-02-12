/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { getTotal } from '../utilities';

export class ItemBatch extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  /**
   * Get the date this batch was added, assuming that was in the earliest transaction batch
   * connected to this item batch.
   *
   * @return  {Date}
   */
  get addedDate() {
    if (this.transactionBatches.length === 0) return new Date();
    const transactionBatches = this.transactionBatches.slice();
    const sortedTransactionBatches = transactionBatches.sort((a, b) => {
      return a.transaction.confirmDate < b.transaction.confirmDate;
    });
    return sortedTransactionBatches[0].transaction.confirmDate;
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  set totalQuantity(quantity) {
    if (quantity < 0) {
      throw new Error('Cannot set a negative item batch quantity');
    }
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  /**
   * Get the sum of all usage in each transaction batch related to this item batch within
   * a starting and ending date.
   *
   * @param   {Date}    startDate  Start date.
   * @param   {Date}    endDate    End date.
   * @return  {number}             The total transaction usage for this batch over the specified
   *                               period.
   */
  totalUsageForPeriod(startDate, endDate) {
    const transactionBatches = this.transactionBatches.filtered(
      'transaction.confirmDate >= $0 && transaction.confirmDate <= $1',
      startDate,
      endDate,
    );

    return getTotal(transactionBatches, 'usage');
  }

  addTransactionBatch(transactionBatch) {
    this.transactionBatches.push(transactionBatch);
  }

  addTransactionBatchIfUnique(transactionBatch) {
    if (this.transactionBatches.filtered('id == $0', transactionBatch.id).length > 0) {
      return;
    }
    this.addTransactionBatch(transactionBatch);
  }

  toString() {
    return `${this.itemName} - Batch ${this.batch}`;
  }
}

export default ItemBatch;

ItemBatch.schema = {
  name: 'ItemBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: { type: 'Item', optional: true },
    packSize: { type: 'double', default: 1 },
    numberOfPacks: { type: 'double', default: 0 },
    expiryDate: { type: 'date', optional: true },
    batch: { type: 'string', default: '' },
    costPrice: { type: 'double', default: 0 },
    sellPrice: { type: 'double', default: 0 },
    supplier: { type: 'Name', optional: true },
    transactionBatches: { type: 'list', objectType: 'TransactionBatch' },
  },
};
