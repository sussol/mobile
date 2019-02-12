import Realm from 'realm';
import { complement } from 'set-manipulator';

import { createRecord, getTotal } from '../utilities';

export class TransactionItem extends Realm.Object {
  destructor(database) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot delete an item from a finalised transaction');
    }
    database.delete('TransactionBatch', this.batches);
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

  get numberOfBatches() {
    return this.batches.length;
  }

  // For customer invoices, return how much can be issued in total, accounting
  // for the fact that any issued in a confirmed customer invoice has already
  // been taken off the total.
  get availableQuantity() {
    if (
      this.transaction.isOutgoing &&
      (this.transaction.isConfirmed || this.transaction.isFinalised)
    ) {
      return this.item.totalQuantity + this.totalQuantity;
    }
    return this.item.totalQuantity;
  }

  /**
   * Returns the batch attached to this transaction item with the given item batch id.
   *
   * @param   {string}            itemId  The item id to look for.
   * @return  {TransactionBatch}          The batch with the matching item id.
   */
  getBatch(itemBatchId) {
    return this.batches.find(transactionBatch => {
      return transactionBatch.itemBatchId === itemBatchId;
    });
  }

  addBatch(transactionBatch) {
    this.batches.push(transactionBatch);
  }

  /**
   * Sets the quantity for the current item by applying the difference to the
   * shortest expiry batches possible.
   *
   * N.B. For customer invoices, will create and delete transaction batches as appropriate.
   * N.B. Supplier invoices do not take effect on the rest of the stock until they
   * are finalised, whereas customer invoices immediately influence stock levels.
   *
   * @param  {Realm}   database  App database.
   * @param  {double}  quantity
   */
  setTotalQuantity(database, quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot set quantity of an item in a finalised transaction');
    }
    let cappedQuantity = quantity;
    if (this.transaction.isOutgoing) {
      cappedQuantity = Math.min(quantity, this.availableQuantity);
    }
    if (quantity < 0) {
      throw new Error('Cannot set a negative quantity on a transaction item');
    }

    const difference = cappedQuantity - this.totalQuantity; // Positive if new quantity is greater.

    // Apply the difference to make the new quantity.
    this.allocateDifferenceToBatches(database, difference);

    // See if any batches can be pruned, i.e. have a quantity of zero for this invoice.
    this.pruneEmptyBatches(database);
  }

  /**
   * Applies the given difference in quantity to the appropriate batches. If the difference
   * is an increase, it will apply to the shortest expiry batches possible. If a reduction,
   * it will apply to the longest batches possible. In this way it is FEFO for customer invoices,
   * and pessimistic with changes to supplier invoices (assumes more of the shortest batch or
   * less of the longest batch). This has the side effect of also being FEFO for supplier credits
   * made from stocktake inventory adjustments, which is optimistic, but not problematic. Null
   * expiries are treated as absolute shortest, which means they will be issued first.
   *
   * @param {Realm}   database    App database.
   * @param {double}  difference  The difference in quantity to set across all batches.
   *                              Positive if greater new quantity, negative if lesser.
   */
  allocateDifferenceToBatches(database, difference) {
    // Sort batches from shortest to longest if increasing, else longest to shortest.
    const batches = this.batches.sorted('expiryDate', difference < 0);

    // First apply as much of the quantity as possible to existing batches.
    let remainder = difference;
    for (let index = 0; remainder !== 0 && index < batches.length; index += 1) {
      remainder = this.allocateDifferenceToBatch(database, remainder, batches[index]);
    }

    // If there is a positive remainder, i.e. more to allocate, add more batches.
    if (remainder > 0) {
      // Use only batches that have some stock on hand (only ones which can be issued
      // from, and also most likely batches to have found more of in stocktake).
      // Sorted shortest to longest expiry date, so that customer invoices issue
      // following a FEFO policy.
      const batchesWithStock = this.item.batchesWithStock.sorted('expiryDate');

      // If there are no batches with stock, start with that which was most likely
      // to be recently in stock, i.e. with the longest expiry date.
      const batchesToUse =
        batchesWithStock.length > 0
          ? batchesWithStock
          : this.item.batches.sorted('expiryDate', true);

      // Get only those batches which are not already in the transaction.
      // TODO: this may actually slow things if most batches not already in transaction
      //       item or all batches already in.
      const itemBatchesToAdd = complement(
        batchesToUse,
        this.batches.map(transactionBatch => {
          return {
            id: transactionBatch.itemBatchId,
          };
        }),
        batch => {
          return batch.id;
        },
      );

      // Go through item batches, adding transaction batches and allocating remainder
      // until no remainder left.
      for (let index = 0; index < itemBatchesToAdd.length && remainder !== 0; index += 1) {
        // Create the new transaction batch and attach it to this transaction item.
        const newBatch = createRecord(database, 'TransactionBatch', this, itemBatchesToAdd[index]);

        // Apply as much of the remainder to it as possible.
        remainder = this.allocateDifferenceToBatch(database, remainder, newBatch);
      }
    }

    if (remainder > 0) {
      // Something went wrong...
      throw new Error(`Failed to allocate ${remainder} of ${difference} to ${this.item.name}`);
    }
  }

  /**
   * Allocates as much as possible of the quantity passed in to the given batch.
   *
   * @param   {Realm}    database    App database.
   * @param   {number}   difference  The difference in quantity to try to allocate.
   * @param   {object}   batch       The transaction batch to apply the quantity to.
   * @return  {int}                  The remainder that could not be applied.
   */
  // eslint-disable-next-line class-methods-use-this
  allocateDifferenceToBatch(database, difference, batch) {
    const batchAddQuantity = batch.getAmountToAllocate(difference);
    batch.setTotalQuantity(database, batch.totalQuantity + batchAddQuantity);
    database.save('TransactionBatch', batch);
    return difference - batchAddQuantity;
  }

  /**
   * Delete any batches from this transaction that do not contribute to the total.
   * E.g. if the quantity being issued in a customer invoice is reduced, do not keep
   * a batch that is no longer being issued in the transaction.
   *
   * @param  {Realm}  database  App database.
   */
  pruneEmptyBatches(database) {
    const batchesToDelete = [];
    this.batches.forEach(batch => {
      if (batch.totalQuantity === 0 && batch.totalQuantitySent === 0) {
        batchesToDelete.push(batch);
      }
    });
    database.delete('TransactionBatch', batchesToDelete);
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

export default TransactionItem;
