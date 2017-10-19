import Realm from 'realm';

import { getTotal, createRecord } from '../utilities';

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

  get countedTotalQuantity() {
    return getTotal(this.batches, 'countedTotalQuantity');
  }

  get difference() {
    return getTotal(this.batches, 'difference');
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
   * Check to see if any StocktakeBatches have been adjusted for this StocktakeItem
   * Will return true if any StocktakeBatches were changed, even if net quantity change
   * for StocktakeItem is 0.
   * @return  {boolean} True if StocktakeBatches have adjustments
   */
  get hasBatchWithQuantityChange() {
    return this.batches.some(stocktakeBatch => stocktakeBatch.difference !== 0);
  }

  get hasCountedBatches() {
    return this.batches.some(stocktakeBatch => stocktakeBatch.hasBeenCounted);
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
    const countedTotalQuantity = this.countedTotalQuantity;
    return countedTotalQuantity !== undefined &&
           countedTotalQuantity !== null &&
           countedTotalQuantity < this.minimumTotalQuantity;
  }

  /**
   * Function is used when adjusting inventory for the StocktakeItem
   * rather then individual StocktakeBatches. Logic:
   * Increasing -> From last expiry to first expiry StocktakeBatch, increase
   * to the maximum of snapshot quantity, after that if still have quantity
   * to increase, apply it to first expiry batch.
   * Reducing -> From first expiry to last expiry StocktakeBatch, decrease
   * quantity by maximum of current counted quantity
   * @param  {Realm}  database   App wide local database
   * @param  {number} quantity   Change in StocktakeItem counted quantity
   */
  setCountedTotalQuantity(database, quantity) {
    let difference = quantity - this.countedTotalQuantity;
    if (difference === 0) return;

    database.write(() => {
      // Create a StocktakeBatch and ItemBatch if none exist
      if (this.batches.length === 0) {
        this.createNewBatch(database);
      }
      const isIncreasingQuantity = difference > 0;
      const sortedBatches = this.batches.sorted('expiryDate', isIncreasingQuantity);

      sortedBatches.some(stocktakeBatch => {
        const batchTotalQuantity = stocktakeBatch.countedTotalQuantity;

        let thisBatchChangeQuantity = 0;
        if (isIncreasingQuantity) {
          thisBatchChangeQuantity = Math.min(stocktakeBatch.snapshotTotalQuantity -
                                            batchTotalQuantity, difference);

          if (thisBatchChangeQuantity <= 0) return false;
        } else {
          thisBatchChangeQuantity = Math.min(batchTotalQuantity, -difference);
          thisBatchChangeQuantity = -thisBatchChangeQuantity;
        }

        stocktakeBatch.countedTotalQuantity = batchTotalQuantity + thisBatchChangeQuantity;

        database.save('StocktakeBatch', stocktakeBatch);

        difference -= thisBatchChangeQuantity;
        return difference === 0;
      });
      // If increasing and we still have difference to add to a batch, add it to the
      // earliest expiry batch
      if (difference > 0) {
        const earliestExpiryBatch = sortedBatches[sortedBatches.length - 1];

        earliestExpiryBatch.countedTotalQuantity += difference;
        database.save('StocktakeBatch', earliestExpiryBatch);
      }
    });
  }

  addBatch(stocktakeBatch) {
    this.batches.push(stocktakeBatch);
  }

  createNewBatch(database) {
    const batchString = `stocktake_${this.stocktake.serialNumber}`;
    const itemBatch = createRecord(database, 'ItemBatch', this.item, batchString);
    createRecord(database, 'StocktakeBatch', this, itemBatch, true);
  }
}

StocktakeItem.schema = {
  name: 'StocktakeItem',
  primaryKey: 'id',
  properties: {
    id: 'string',
    item: 'Item',
    stocktake: 'Stocktake',
    batches: { type: 'list', objectType: 'StocktakeBatch' },
  },
};
