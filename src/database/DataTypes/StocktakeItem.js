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
