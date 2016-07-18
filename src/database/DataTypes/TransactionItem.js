import Realm from 'realm';

import { getTotal } from '../utilities';
import { createRecord } from '../createRecord';

export class TransactionItem extends Realm.Object {

  destructor(database) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot delete an item from a finalised transaction');
    }
    this.batches.forEach(transactionBatch => database.delete('TransactionBatch', transactionBatch));
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  get itemCode() {
    return this.item ? this.item.code : '';
  }

  get totalQuantity() {
    return getTotal(this.batches, 'totalQuantity');
  }

  get totalQuantitySent() {
    return getTotal(this.batches, 'totalQuantitySent');
  }

  get totalPrice() {
    return getTotal(this.batches, 'totalPrice');
  }

  // For customer invoices, return how much can be issued in total, accounting
  // for the fact that any issued in a confirmed customer invoice has already
  // been taken off the total
  get availableQuantity() {
    if (this.transaction.isOutgoing &&
       (this.transaction.isConfirmed ||
        this.transaction.isFinalised)) {
      return this.item.totalQuantity + this.totalQuantity;
    }
    return this.item.totalQuantity;
  }

  /**
   * Returns the batch attached to this transaction item with the given item batch id
   * @param  {string} itemId The item id to look for
   * @return {object}        The TransactionBatch with the matching item id
   */
  getBatch(itemBatchId) {
    return this.batches.find(transactionBatch => transactionBatch.itemBatchId === itemBatchId);
  }

  addBatch(transactionBatch) {
    this.batches.push(transactionBatch);
  }

  /**
   * Sets the quantity for the current item by applying the difference to the
   * shortest expiry batches possible.
   * N.B. For customer invoices, will create and delete transaction batches as appropriate.
   * N.B. Supplier invoices do not take effect on the rest of the stock until they
   * are finalised, whereas customer invoices immediately influence stock levels.
   * @param {double} quantity The total quantity to set across all batches
   */
  setTotalQuantity(database, quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot set quantity of an item in a finalised transaction');
    }
    if (quantity < 0) throw new Error('Cannot set a negative quantity on a transaction item');

    const difference = quantity - this.totalQuantity; // Positive if new quantity is greater

    // Apply the difference to make the new quantity
    let remainder = this.allocateDifferenceToBatches(database, difference);

    // Go through item batches in stock, adding new transaction batches as
    // required to get rid of remainder
    for (let index = 0; index < this.item.batches.length && remainder !== 0; index ++) {
      const itemBatch = this.item.batches[index];

      // Skip if item batch has no stock, or is already in this TransactionItem
      if (itemBatch.totalQuantity <= 0 ||
        this.batches.find(transactionBatch => transactionBatch.itemBatch === itemBatch)) continue;

      // Create the new transaction batch and attach it to this transaction item
      createRecord(database, 'TransactionBatch', this, itemBatch);


      // Apply as much of the remainder to it as possible
      remainder = this.allocateDifferenceToBatches(database, remainder);
    }

    // See if any batches can be pruned, i.e. have 0 quantity for this invoice
    const batchesToDelete = [];
    this.batches.forEach(batch => {
      if (batch.totalQuantity === 0) batchesToDelete.push(batch);
    });
    database.delete('TransactionBatch', batchesToDelete);

    if (remainder > 0) { // Something went wrong
      throw new Error(`Failed to allocate ${remainder} of ${quantity} to ${this.item.name}`);
    }
  }

  /**
   * Applies the given difference in quantity to the appropriate batches. If the difference
   * is an increase, it will apply to the shortest expiry batches possible. If a reduction,
   * it will apply to the longest batches possible. In this way it is FEFO for customer invoices,
   * and pessimistic with changes to supplier invoices (assumes you got more of the shortest
   * batch or less of the longest batch.)
   * @param {Realm}      database      App wide local database
   * @param {double}     difference    The difference in quantity to set across all batches.
   *                                   Will be positive if greater new quantity, negative
   *                                   if lesser.
   * @return {double}    remainder     The difference not able to be applied to the batches
   *                                   passed in.
   */
  allocateDifferenceToBatches(database, difference) {
    // Sort batches shortest -> longest batch if increasing, longest -> shortest if reducing
    const batches = this.batches.sorted('expiryDate', difference < 0);

    // First apply as much of the quantity as possible to existing batches
    let addQuantity = difference;
    for (let index = 0; addQuantity !== 0 && index < batches.length; index++) {
      const batchAddQuantity = batches[index].getAmountToAllocate(addQuantity);
      batches[index].setTotalQuantity(database, batches[index].totalQuantity + batchAddQuantity);
      addQuantity -= batchAddQuantity;
      database.save('TransactionBatch', batches[index]);
    }
    return addQuantity; // The remainder, not able to be allocated to the batches passed in
  }
}

TransactionItem.schema = {
  name: 'TransactionItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    transaction: 'Transaction',
    batches: { type: 'list', objectType: 'TransactionBatch' },
  },
};
