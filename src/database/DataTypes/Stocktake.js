import Realm from 'realm';
import { complement } from 'set-manipulator';

import { addBatchToParent, createRecord, getTotal } from '../utilities';

export class Stocktake extends Realm.Object {
  destructor(database) {
    if (this.isFinalised) throw new Error('Cannot delete a finalised Stocktake');
    database.delete('StocktakeItem', this.items);
  }

  // Adds a StocktakeBatch, incorporating it into a matching StocktakeItem.
  addBatch(database, stocktakeBatch) {
    addBatchToParent(stocktakeBatch, this, () =>
      createRecord(database, 'StocktakeItem', this, stocktakeBatch.itemBatch.item)
    );
  }

  /**
   * Sets the stocktake items attached to this stocktake, based on the array of
   * item ids passed in
   * @param   {Realm} database   App wide local database
   * @param   {array} itemIds    The ids of the items to include in this stocktake
   * @return  {none}
   */
  setItemsByID(database, itemIds) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised stocktake');

    // Delete any stocktake items that aren't in the new array of ids
    const itemsToRemove = complement(this.items,
                                     itemIds.map((itemId) => ({ itemId: itemId })),
                                     (stocktakeItem) => stocktakeItem.itemId);
    if (itemsToRemove && itemsToRemove.length > 0) database.delete('StocktakeItem', itemsToRemove);

    // Add a new StocktakeItem for each new item id not currently in the stocktake
    const itemIdsToAdd = complement(itemIds,
                                    this.items.map((stocktakeItem) => stocktakeItem.itemId));
    const items = database.objects('Item');
    itemIdsToAdd.forEach((itemId) => {
      // Find the matching database item and use it to create a stocktake item
      const item = items.filtered('id == $0', itemId)[0];
      const stocktakeItem = createRecord(database, 'StocktakeItem', this, item);

      // Add all item batches currently in stock to the stocktake item as stocktake batches
      item.batchesWithStock.forEach((itemBatch) =>
        createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch));
    });
  }

  get isConfirmed() {
    return this.status === 'confirmed';
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Check whether at least one stocktake item has a counted quantity set
   * @return {boolean} True if one or more counted items, otherwise false
   */
  get hasSomeCountedItems() {
    return this.items.filtered('countedTotalQuantity != null').length === 0;
  }

  /**
   * Get any stocktake items that would cause a reduction larger than the amount
   * of available stock in inventory if it were finalised.
   * @return {array} All stocktake items that have been reduced below minimum level
   */
  get itemsBelowMinimum() {
    const itemsBelowMinimum = [];
    this.items.forEach((stocktakeItem) => {
      if (stocktakeItem.isReducedBelowMinimum) itemsBelowMinimum.push(stocktakeItem);
    });
    return itemsBelowMinimum;
  }

  get numberOfBatches() {
    return getTotal(this.items, 'numberOfBatches');
  }

  /**
   * Finalises this stocktake, creating transactions to apply the stock changes to inventory
   * @param {Realm.Object}  user     The current user logged in
   * @param {Realm}         database App wide local database
   */
  finalise(database, user) {
    // Create the transactions for additions and reductions
    const date = new Date();

    // Create inventory adjustment transactions as required, and allocate batches
    this.adjustInventory(database, user, date);

    // Set the stocktake finalise details
    this.finalisedBy = user;
    this.stocktakeDate = date;
    this.status = 'finalised';
  }

  /**
   * Applies differences in snapshot and counted quantities to the appropriate inventory
   * adjustment transactions. Will create this.additions and this.reductions if needed.
   * @param  {Realm}  database   App wide local database
   * @param  {object} user       The user that finalised this stocktake
   * @param  {Date}   date       The current date
   * @return {none}
   */
  adjustInventory(database, user, date) {
    // Go through each item, add it to the appropriate transaction, then copy over the
    // batch quantities allocated by the transaction item
    const uncountedItems = [];
    this.items.forEach((stocktakeItem) => {
      // If no counted quantity was entered, remember the item to delete
      if (stocktakeItem.countedTotalQuantity === null) {
        uncountedItems.push(stocktakeItem);
        return; // This is a 'continue' in the context of the forEach loop
      }

      // Work out whether this should be in the additions or reductions transaction
      const difference = stocktakeItem.countedTotalQuantity - stocktakeItem.snapshotTotalQuantity;

      // Lazily create additions/reductions as and when they are required
      if (difference >= 0 && this.additions === null) {
        this.additions = createRecord(database, 'InventoryAdjustment', user, date, true);
      } else if (difference < 0 && this.reductions === null) {
        this.reductions = createRecord(database, 'InventoryAdjustment', user, date, false);
      }

      // Get the appropriate transaction to use for this item
      const transaction = difference >= 0 ? this.additions : this.reductions;

      // Create and add TransactionItem to the transaction
      const item = stocktakeItem.item;
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);

      // If this item has no batches with stock, add a new empty batch
      if (difference > 0 && item.batchesWithStock.length === 0) {
        const batchString = `stocktake_${this.serialNumber}`;
        const itemBatch = createRecord(database, 'ItemBatch', item, batchString);
        createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch);
        createRecord(database, 'TransactionBatch', transactionItem, itemBatch);
      }

      // Set the transaction item's quantity, causing it to handle batch logic
      // and apply adjustments to inventory
      transactionItem.setTotalQuantity(database, Math.abs(difference));

      // Copy batch quantities from transaction item to the stocktake item
      stocktakeItem.applyBatchAdjustments(database, transactionItem);

      // Prune off any batches with 0 quantity that were unchanged
      stocktakeItem.pruneBatches(database);

      // Save the stocktake item
      database.save('StocktakeItem', stocktakeItem);
    });
    // Prune off any items that did not get counted
    database.delete('StocktakeItem', uncountedItems);
  }
}

Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: 'string',
    createdDate: 'date', // Includes time
    stocktakeDate: { type: 'date', optional: true },
    status: 'string',
    createdBy: { type: 'User', optional: true },
    finalisedBy: { type: 'User', optional: true },
    comment: { type: 'string', optional: true },
    serialNumber: 'string',
    items: { type: 'list', objectType: 'StocktakeItem' },
    additions: { type: 'Transaction', optional: true },
    reductions: { type: 'Transaction', optional: true },
  },
};
