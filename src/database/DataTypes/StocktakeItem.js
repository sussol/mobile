import Realm from 'realm';

import { getTotal, createRecord } from '../utilities';

/**
 * A stocktake item.
 *
 * @property  {string}                 id
 * @property  {Item}                   item
 * @property  {Stocktake}              stocktake
 * @property  {List.<StocktakeBatch>}  batches
 */
export class StocktakeItem extends Realm.Object {
  /**
   * Delete stocktake item. Throw error is associated stocktake is finalised.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    if (this.stocktake && this.stocktake.isFinalised) {
      throw new Error('Cannot delete a StocktakeItem belonging to a finalised stocktake');
    }
    database.delete('StocktakeBatch', this.batches);
  }

  get hasValidDoses() {
    return this.batches.every(({ hasValidDoses }) => hasValidDoses);
  }

  get isVaccine() {
    return this.item?.isVaccine ?? false;
  }

  /**
   * Get snapshot of total quantity of item.
   *
   * @return  {number}
   */
  get snapshotTotalQuantity() {
    return getTotal(this.batches, 'snapshotTotalQuantity');
  }

  /**
   * Get total quantity of item.
   *
   * @return  {number}
   */
  get countedTotalQuantity() {
    return getTotal(this.batches, 'countedTotalQuantity');
  }

  /**
   * Get total difference of all batches of this stocktake item.
   */
  get difference() {
    return getTotal(this.batches, 'difference');
  }

  /**
   * Get id of stocktake item.
   */
  get itemId() {
    return this.item ? this.item.id : '';
  }

  /**
   * Get name of stocktake item.
   */
  get itemName() {
    return this.item ? this.item.name : '';
  }

  /**
   * Get code of stocktake item.
   */
  get itemCode() {
    return this.item ? this.item.code : '';
  }

  /**
   * Get if any stocktake batches have been adjusted for this stocktake item.
   *
   * Will return true if any stocktake bathces were changed, even if net quantity
   * change for stocktake item is 0.
   *
   * @return  {boolean}
   */
  get hasBeenCounted() {
    // Return true if any batches of this stocktake item have adjustments.
    return this.batches.some(
      stocktakeBatch => stocktakeBatch.isValid() && stocktakeBatch.hasBeenCounted
    );
  }

  /**
   * Get number of batches associated with this stocktake item.
   *
   * @return  {number}
   */
  get numberOfBatches() {
    return this.batches.length;
  }

  /**
   * Get if this item quantity would reduce the amount of any batch's stock in inventory to
   * negative levels if it were finalised.
   *
   * E.g. an item is added to a stocktake with a snapshot quantity of x, then is counted
   * to have a quantity of y < x, but concurrently there has been a reduction in the stock
   * in inventory, e.g. a customer invoice. The reduction caused by this stocktake item
   * item would then result in negative inventory.
   *
   * @return  {Boolean}
   */
  get isReducedBelowMinimum() {
    // Return true if the counted quantity is below the minimum for this item.
    return this.batches.some(batch => batch.isReducedBelowMinimum);
  }

  /**
   * Get if item is out of date.
   *
   * An stocktake item is out of date if any batch has a snapshot total quantity inconsistent
   * with the corresponding item batch or has different batches to the corresponding item.
   *
   * @return  {boolean}
   */
  get isOutdated() {
    // Return true if any batch is out of date.
    if (this.batches.some(batch => batch.isSnapshotOutdated)) {
      return true;
    }

    // Check all item batches (with stock) are included by finding matching id in a stocktake batch
    // for this stocktake item.
    const itemBatchesWithStock = this.item.batchesWithStock;
    if (
      itemBatchesWithStock.some(
        itemBatch =>
          !this.batches.some(stocktakeBatch => stocktakeBatch.itemBatch.id === itemBatch.id)
      )
    ) {
      return true;
    }

    return false;
  }

  /**
   * Returns the title of the most common option within this stocktakeItem's batches
   * @return {string} The title of the reason with the highest frequency
   */
  get reasonTitle() {
    if (!this.batches.length) return '';

    // Mapping table for ranking reasons by usage
    // {option.id: {option: OptionObject, count: X}, ... }
    const options = {};

    this.batches.forEach(batch => {
      const { option } = batch;
      if (!option) return;
      const { id } = option;

      // If we've counted this option before, increment,
      // otherwise add to the table with an initial count of 1
      if (options[id]) {
        options[id].count += 1;
      } else {
        options[id] = { count: 1, option };
      }
    });

    // Sort (ASC) the options by count
    const sortedOptions = Object.values(options).sort((a, b) => b.count - a.count);
    // Return the first option title or empty string if there aren't any options
    return sortedOptions[0] ? sortedOptions[0].option.title : '';
  }

  /**
   * Returns a string representing the units for this stocktake item.
   * @return {string} the unit for this stocktake item, or N/A if none has been assigned.
   */
  get unitString() {
    return this.item?.unitString;
  }

  /**
   * Returns an indicator that all batches related to this item have a correct
   * reason/option applied. A correct reason being a `positiveInventoryAdjustment`
   * for positive differences and vice versa for negative differences and no reason
   * when there is no difference.
   */
  get validateReason() {
    return this.batches.every(
      ({ validateReason: batchHasValidatedReason }) => batchHasValidatedReason
    );
  }

  /**
   * Reset this stocktake item, deleting all batches and recreating them for each corresponding item
   * batch in inventory.
   *
   * @param  {Realm}  database
   */
  reset(database) {
    database.delete('StocktakeBatch', this.batches);
    this.item.batchesWithStock.forEach(itemBatch => {
      // |createRecord()| will save; notifying listeners.
      createRecord(database, 'StocktakeBatch', this, itemBatch);
    });
  }

  /**
   * Set counted total quantity for stocktake item.
   *
   * Helper for adjusting inventory for stocktake items rather then individual
   * stocktake batches. By increasing from last expiry to first expiry, the batch
   * increases to the maximum of snapshot quantity.
   *
   * If quantity deficit remains, apply it to first expiry batch.
   *
   * Reducing is done from first batch expiry to last batch expiry, decreasing
   * quantity by maximum of current counted quantity.
   *
   * @param  {Realm}   database
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
            difference
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

      // If increasing and still have difference to add to a batch, add it to the earliest expiry
      // batch.
      if (difference > 0) {
        const earliestExpiryBatch = sortedBatches[sortedBatches.length - 1];

        earliestExpiryBatch.countedTotalQuantity += difference;
        database.save('StocktakeBatch', earliestExpiryBatch);
      }
    });
  }

  /**
   * Add a batch to this stocktake item.
   *
   * @param  {StocktakeBatch}  stocktakeBatch
   */
  addBatch(stocktakeBatch) {
    this.batches.push(stocktakeBatch);
  }

  /**
   * Create a stocktake batch and associated item batch for this stocktake item.
   *
   * @param  {Realm}  database
   */
  createNewBatch(database) {
    const inventoryAdjustmentName = database
      .objects('Name')
      .filtered('type == "inventory_adjustment"')[0];
    const batchString = `stocktake_${this.stocktake.serialNumber}`;
    const itemBatch = createRecord(
      database,
      'ItemBatch',
      this.item,
      batchString,
      inventoryAdjustmentName
    );
    return createRecord(database, 'StocktakeBatch', this, itemBatch, true);
  }

  /**
   * Removes reasons from related batches if they have no difference between
   * snapshot and counted quantity.
   *
   * @param {Realm} database App-wide database interface
   */
  removeReason(database) {
    this.batches.forEach(batch => {
      if (!this.difference) batch.removeReason(database);
    });
  }

  /**
   * Applies the given Options object to all stocktake batches associated to
   * this stocktake item, if there is a difference between countedTotalQuantity
   * and snapshotTotalQuantity.
   * @param {Realm}   database App-wide database interface.
   * @param {Options} option   Option object to apply.
   */
  applyReason(database, option) {
    this.batches.forEach(batch => batch.applyReason(database, option));
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

export default StocktakeItem;
