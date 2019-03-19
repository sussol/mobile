import Realm from 'realm';
import { createRecord } from '../utilities';

export class StocktakeBatch extends Realm.Object {
  get snapshotTotalQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  get countedTotalQuantity() {
    if (this.countedNumberOfPacks === null) return this.snapshotTotalQuantity;
    return this.countedNumberOfPacks * this.packSize;
  }

  /**
   * Stock on hand should never be negative. This can occur when stock has been issued
   * in a customer invoice for this batch before the parent stocktake was finalised.
   * If the difference applied to the |stockOnHand| for this batch would result in a
   * negative, return true.
   *
   * @return {boolean} True if |stockOnHand + stocktakebatch.difference| is negative.
   */
  get isReducedBelowMinimum() {
    const stockOnHand = this.itemBatch.totalQuantity;
    return stockOnHand + this.difference < 0;
  }

  /**
   * Returns true if the |snapshotTotalQuantity| does not match the |totalQuantity| of the
   * |itemBatch| this |stocktakeBatch| is associated with. Will occur if inventory has changed
   * since this |stocktakeBatch| was created. If the net change on this batch is 0, then return
   * false.
   *
   * @return {boolean} True if |snapshotTotalQuantity !== this.itemBatch.totalQuantity|
   */
  get isSnapshotOutdated() {
    return this.snapshotTotalQuantity !== this.itemBatch.totalQuantity;
  }

  get hasBeenCounted() {
    return this.countedNumberOfPacks !== null;
  }

  get itemId() {
    if (!this.itemBatch) return '';
    return this.itemBatch.item ? this.itemBatch.item.id : '';
  }

  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  get difference() {
    return this.countedTotalQuantity - this.snapshotTotalQuantity;
  }

  set countedTotalQuantity(quantity) {
    // Handle packsize of 0.
    this.countedNumberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  /**
   * Finalising stocktake batch will adjust inventory appropriately and will add a
   * new transaction batch in reducing or increasing transaction for this stocktake.
   *
   * @param  {Realm}  database  App database.
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
      // or decreased is determined by the transaction, so we need to use the absolute value of
      // difference (i.e. always treat as positive).
      const snapshotDifference = Math.abs(this.difference);
      transactionBatch.setTotalQuantity(database, snapshotDifference);
      database.save('TransactionBatch', transactionBatch);
    }
    database.save('ItemBatch', this.itemBatch);
  }

  toString() {
    return `Stocktake batch representing ${this.itemBatch}`;
  }

  destructor(database) {
    // Delete item batch that was created as a result of creating this stocktake batch.
    if (this.snapshotNumberOfPacks === 0 && this.itemBatch.numberOfPacks === 0) {
      database.delete('ItemBatch', this.itemBatch);
    }
  }
}

export default StocktakeBatch;

StocktakeBatch.schema = {
  name: 'StocktakeBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemBatch: 'ItemBatch',
    snapshotNumberOfPacks: 'double',
    packSize: 'double',
    expiryDate: { type: 'date', optional: true },
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    countedNumberOfPacks: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
    option: { type: 'Options', optional: true },
  },
};
