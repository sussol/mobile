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
   * Check to see if any |StocktakeBatches| have been adjusted for this |StocktakeItem|.
   * Will return true if any |StocktakeBatches| were changed, even if net quantity change
   * for StocktakeItem is 0.
   *
   * @return  {boolean}  True if |StocktakeBatches| have adjustments.
   */
  get hasCountedBatches() {
    return this.batches.some(stocktakeBatch => {
      return stocktakeBatch.isValid() && stocktakeBatch.hasBeenCounted;
    });
  }

  get numberOfBatches() {
    return this.batches.length;
  }

  /**
   * Returns true if this item quantity would reduce the amount of any batch's stock
   * in inventory to negative levels, if it were finalised.
   *
   * E.g. an item is added to a stocktake with a snapshot quantity of x, then is counted
   * to have a quantity of y < x, but concurrently there has been a reduction in the stock
   * in inventory, e.g. a customer invoice. The reduction caused by this stocktake item
   * item would then result in negative inventory.
   *
   * @return  {Boolean}  True is the counted quantity is below the minimum for this item.
   */
  get isReducedBelowMinimum() {
    return this.batches.some(batch => {
      return batch.isReducedBelowMinimum;
    });
  }

  /**
   * Check if item is out of date.
   *
   * An item is out of date if:
   *
   * - Any batch has a snapshot total quantity inconsistent with the corresponding 'ItemBatch'
   *   total quantity.
   * - The corresponding 'Item' has different batches to 'StocktakeItem'.
   *
   * @return  {boolean}  True if any batch is out of date.
   */
  get isOutdated() {
    if (
      this.batches.some(batch => {
        return batch.isSnapshotOutdated;
      })
    ) {
      return true;
    }

    // Check all item batches (with stock) are included by finding matching id in a stocktake batch
    // for this stocktake item.
    const itemBatchesWithStock = this.item.batchesWithStock;
    if (
      itemBatchesWithStock.some(itemBatch => {
        return !this.batches.some(stocktakeBatch => {
          return stocktakeBatch.itemBatch.id === itemBatch.id;
        });
      })
    ) {
      return true;
    }

    // This stocktake item is not out of date.
    return false;
  }

  /**
   * Will reset this stocktake item, deleting all batches and
   * recreating them for each corresponding item batch currently
   * in inventory.
   *
   * @param  {Realm}  database  App database.
   */
  reset(database) {
    database.delete('StocktakeBatch', this.batches);
    this.item.batchesWithStock.forEach(itemBatch => {
      // createRecord will save; notifying listeners.
      createRecord(database, 'StocktakeBatch', this, itemBatch);
    });
  }

  /**
   * Helper for adjusting inventory for stocktake items rather then individual
   * stocktake batches. By increasing from last expiry to first expiry, the batch
   * increases to the maximum of snapshot quantity.
   *
   * If quantity deficit remains, apply it to first expiry batch.
   *
   * Reducing is done from first batch expiry to last batch expiry, decreasing
   * quantity by maximum of current counted quantity.
   *
   * @param  {Realm}   database  App database.
   * @param  {number}  quantity  Change in counted item quantity.
   */
  setCountedTotalQuantity(database, quantity) {
    database.write(() => {
      // If there are no batches, create one.
      if (this.batches.length === 0) {
        this.createNewBatch(database);
      }

      let difference = quantity - this.countedTotalQuantity;

      // If the number input by user in the 'Actual Quantity' field is the same as
      // the snapshot quantity, the 'Not Counted' placeholder should be removed.
      if (quantity === this.snapshotTotalQuantity) {
        this.batches.forEach(stocktakeBatch => {
          stocktakeBatch.countedTotalQuantity = stocktakeBatch.snapshotTotalQuantity;
          database.save('StocktakeBatch', stocktakeBatch);
        });
        return;
      }

      const isIncreasingQuantity = difference > 0;
      const sortedBatches = this.batches.sorted('expiryDate', isIncreasingQuantity);

      sortedBatches.some(stocktakeBatch => {
        const batchTotalQuantity = stocktakeBatch.countedTotalQuantity;

        let thisBatchChangeQuantity = 0;
        if (isIncreasingQuantity) {
          thisBatchChangeQuantity = Math.min(
            stocktakeBatch.snapshotTotalQuantity - batchTotalQuantity,
            difference,
          );

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
      // earliest expiry batch.
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

export default StocktakeItem;

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
