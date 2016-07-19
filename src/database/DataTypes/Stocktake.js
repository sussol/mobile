import Realm from 'realm';
import { addBatchToParent, createRecord } from '../utilities';

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

  setItemsByID(database, newItemsIds) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised stocktake');
    const items = database.objects('Item');
    this.items.forEach((stocktakeItem) => {
      const itemId = stocktakeItem.itemId;
      const itemIdIndex = newItemsIds.indexOf(itemId);
      // If an item in newItemsIds already exists in the stocktake, remove it from newItemsIds.
      if (itemIdIndex >= 0) {
        newItemsIds.splice(itemIdIndex, 1);
      }
      // If the item in the stocktake is not in the newItemsIds, remove it from the stocktake.
      if (!newItemsIds.some(id => id === itemId)) {
        database.delete('StocktakeItem', stocktakeItem);
      }
    });
    // Add StocktakeItem for each Item.id in newItemsIds to the stocktake.
    newItemsIds.forEach((itemId) => {
      const item = items.find(i => i.id === itemId);
      const stocktakeItem = createRecord(database, 'StocktakeItem', this, item);
      item.batches.forEach((itemBatch) =>
        createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch));
    });
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

      // If this item has not previously had stock, add a new empty batch
      if (difference > 0 && item.batches.length === 0) {
        const itemBatch = createRecord(database, 'ItemBatch', item);
        createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch);
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
