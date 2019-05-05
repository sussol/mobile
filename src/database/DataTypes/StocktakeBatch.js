import Realm from 'realm';
import { createRecord } from '../utilities';

/**
 * A stocktake batch.
 *
 * @property  {string}     id
 * @property  {Stocktake}  stocktake
 * @property  {ItemBatch}  itemBatch
 * @property  {number}     snapshotNumberOfPacks
 * @property  {number}     packSize
 * @property  {Date}       expiryDate
 * @property  {string}     batch
 * @property  {number}     costPrice
 * @property  {number}     sellPrice
 * @property  {number}     countedNumberOfPacks
 * @property  {number}     sortIndex
 */
export class StocktakeBatch extends Realm.Object {
  /**
   * Delete stocktake batch and associated item batch.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    if (this.snapshotNumberOfPacks === 0 && this.itemBatch.numberOfPacks === 0) {
      database.delete('ItemBatch', this.itemBatch);
    }
  }

  /**
   * Get snapshot of total quantity in batch.
   *
   * @return  {number}
   */
  get snapshotTotalQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  /**
   * Get total quantity in batch.
   *
   * @return  {number}
   */
  get countedTotalQuantity() {
    if (this.countedNumberOfPacks === null) return this.snapshotTotalQuantity;
    return this.countedNumberOfPacks * this.packSize;
  }

  /**
   * Get if stocktake will reduce stock on hand of item below zero.
   *
   * Stock on hand should never be negative. This can occur when stock has been issued
   * in a customer invoice for this batch before the parent stocktake was finalised.
   *
   * @return  {boolean}
   */
  get isReducedBelowMinimum() {
    const { totalQuantity: stockOnHand } = this.itemBatch;

    // Return true if |stockOnHand + stocktakebatch.difference| is negative.
    return stockOnHand + this.difference < 0;
  }

  /**
   * Get if snapshot is out-of-date.
   *
   * Returns true if the |snapshotTotalQuantity| does not match the |totalQuantity| of the
   * item batch this stocktake batch is associated with. Will occur if inventory has changed
   * since this stocktake batch was created. If the net change on this batch is 0, then return
   * false.
   *
   * @return  {boolean}
   */
  get isSnapshotOutdated() {
    return this.snapshotTotalQuantity !== this.itemBatch.totalQuantity;
  }

  /**
   * Get if stocktake batch has been counted.
   *
   * @return  {boolean}
   */
  get hasBeenCounted() {
    return this.countedNumberOfPacks !== null;
  }

  /**
   * Get id of item associated with this stocktake batch.
   *
   * @return  {string}
   */
  get itemId() {
    if (!this.itemBatch) return '';
    return this.itemBatch.item ? this.itemBatch.item.id : '';
  }

  /**
   * Get id of item batch associated with this stocktake batch.
   *
   * @return  {string}
   */
  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  /**
   * Get difference between counted quantity and snapshop quantity.
   *
   * @return  {number}
   */
  get difference() {
    return this.countedTotalQuantity - this.snapshotTotalQuantity;
  }

  /**
   * Set counted total quantity.
   *
   * @param  {number}  quantity
   */
  set countedTotalQuantity(quantity) {
    // Handle packsize of 0.
    this.countedNumberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  /**
   * Finalise stocktake batch.
   *
   * Finalising will adjust inventory appropriately and will add a new transaction
   * batch in reducing or increasing transaction for this stocktake.
   *
   * @param  {Realm}  database
   */
  finalise(database) {
    // Update the item batch details.
    this.itemBatch.batch = this.batch;
    this.itemBatch.expiryDate = this.expiryDate;

    // Make inventory adjustments if there is a difference to apply.
    if (this.difference !== 0) {
      const isAddition = this.countedTotalQuantity > this.snapshotTotalQuantity;
      const inventoryAdjustment = isAddition
        ? this.stocktake.getAdditions(database)
        : this.stocktake.getReductions(database);

      // Create transaction item and transaction batch to store inventory adjustments in this
      // stocktake.
      const transactionItem = createRecord(
        database,
        'TransactionItem',
        inventoryAdjustment,
        this.itemBatch.item
      );
      const transactionBatch = createRecord(
        database,
        'TransactionBatch',
        transactionItem,
        this.itemBatch
      );

      // Apply difference from stocktake to actual stock on hand levels. Whether stock is increased
      // or decreased is determined by the transaction, use the absolute value of difference
      // (i.e. always treat as positive).
      const snapshotDifference = Math.abs(this.difference);
      transactionBatch.setTotalQuantity(database, snapshotDifference);
      database.save('TransactionBatch', transactionBatch);
    }
    database.save('ItemBatch', this.itemBatch);
  }

  /**
   * Get string representation of stocktake batch.
   *
   * @return  {string}
   */
  toString() {
    return `Stocktake batch representing ${this.itemBatch}`;
  }
}

StocktakeBatch.schema = {
  name: 'StocktakeBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemBatch: 'ItemBatch',
    snapshotNumberOfPacks: { type: 'double', optional: true },
    packSize: { type: 'double', optional: true },
    expiryDate: { type: 'date', optional: true },
    batch: 'string',
    costPrice: { type: 'double', optional: true },
    sellPrice: { type: 'double', optional: true },
    countedNumberOfPacks: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};

export default StocktakeBatch;
