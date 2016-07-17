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

  /**
   * Returns the item attached to this stocktake with the item id supplied
   * @param  {string} itemId The item id to look for
   * @return {object}        The StocktakeItem with the matching item id
   */
  getBatch(itemBatchId) {
    return this.batches.find(stocktakeBatch => stocktakeBatch.itemBatchId === itemBatchId);
  }

  /**
   * Applies the adjustments to batches in the given transaction item to the batches
   * in this stocktake item
   * @param  {object}  transactionItem The transaction item
   * @param  {Boolean} isAddition      Whether this should increase the count ()
   * @return {none}
   */
  applyBatchAdjustments(transactionItem, isAddition) {
    transactionItem.batches.forEach((transactionBatch) => {
      const stocktakeBatch = this.getBatch(transactionBatch.itemBatchId);
      const difference = isAddition ?
                          transactionBatch.totalQuantity :
                          -transactionBatch.totalQuantity;
      stocktakeBatch.countedTotalQuantity = stocktakeBatch.snapshotTotalQuantity + difference;
    });
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
