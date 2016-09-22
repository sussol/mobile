import Realm from 'realm';

import { getTotal } from '../utilities';

export class StocktakeItem extends Realm.Object {
  destructor(database) {
    if (this.stocktake && this.stocktake.isFinalised) {
      throw new Error('Cannot delete a StocktakeItem belonging to a finalised stocktake');
    }
    database.delete('StocktakeBatch', this.batches);
  }

  get snapshotTotalQuantity() {
    return getTotal(this.batches, 'snapshotTotalQuantity');
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

  get numberOfBatches() {
    return this.batches.length;
  }

  /**
   * If the stock has increased or not been changed since the item quantity was
   * snapshot, the minimum is 0. If the stock has reduced since the item was
   * snapshot, the minimum total quantity that can be sensibly considered as the
   * counted quantity is the snapshot quantity minus the current stock on hand.
   * This is because it doesn't make sense to count an amount that represents a
   * reduction greater than the current stock on hand, which would create negative
   * inventory.
   * @return {integer} The minimum total quantity that can be sensibly counted
   */
  get minimumTotalQuantity() {
    return this.item ? Math.max(0, this.snapshotTotalQuantity - this.item.totalQuantity) : 0;
  }

  /**
   * Returns true if this stocktake item's counted quantity would reduce the amount
   * of stock in inventory to negative levels, if it were finalised. This can happen
   * if, for example, an item is added to a stocktake with a snapshot quantity of
   * 10, then is counted to have a quantity of 8, but concurrently there has been
   * a reduction in the stock in inventory, e.g. a customer invoice for 9. In this
   * example, the stock on hand is now 1, so a reduction of 2 caused by this stocktake
   * item would result in negative inventory.
   * @return {Boolean} Whether the counted quantity is below the minimum for this item
   */
  get isReducedBelowMinimum() {
    return this.countedTotalQuantity !== undefined &&
           this.countedTotalQuantity !== null &&
           this.countedTotalQuantity < this.minimumTotalQuantity;
  }

  addBatch(stocktakeBatch) {
    this.batches.push(stocktakeBatch);
    if (!this.countedTotalQuantity) this.countedTotalQuantity = stocktakeBatch.countedTotalQuantity;
    else this.countedTotalQuantity += stocktakeBatch.countedTotalQuantity;
  }

  /**
   * Applies the adjustments to batches in the given transaction item to the batches
   * in this stocktake item
   * @param  {Realm}   database        App wide database
   * @param  {object}  transactionItem The transaction item
   * @return {none}
   */
  applyBatchAdjustments(database, transactionItem) {
    this.batches.forEach((stocktakeBatch) => {
      const transactionBatch = transactionItem.getBatch(stocktakeBatch.itemBatchId);
      let difference = 0;
      if (transactionBatch) { // If a matching transaction batch, work out the difference
        difference = transactionItem.transaction.isIncoming ?
                            transactionBatch.totalQuantity :
                            -transactionBatch.totalQuantity;
      }
      stocktakeBatch.countedTotalQuantity = stocktakeBatch.snapshotTotalQuantity + difference;
      database.save('StocktakeBatch', stocktakeBatch);
    });
  }

  /**
   * Deletes any batches from this stocktake item that had no stock and did not change
   * @param  {Realm} database  App wide database
   * @return {none}
   */
  pruneBatches(database) {
    database.delete(
      'StocktakeBatch',
      this.batches.filtered('snapshotNumberOfPacks == 0 AND countedNumberOfPacks == 0')
    );
  }
}

StocktakeItem.schema = {
  name: 'StocktakeItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    stocktake: 'Stocktake',
    countedTotalQuantity: { type: 'double', optional: true },
    batches: { type: 'list', objectType: 'StocktakeBatch' },
  },
};
