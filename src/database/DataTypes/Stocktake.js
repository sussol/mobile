import Realm from 'realm';
import { addBatchToParent } from '../utilities';
import { createRecord } from '../createRecord';


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
      createRecord(database, 'StocktakeItem', this, item);
    });
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Finalises this stocktake, creating transactions to apply the stock changes to inventory
   * @param {Realm.Object}  user     The current user logged in
   * @param {Realm}         database App wide local database
   */
  finalise(database, user) {
    // Create the transactions for additions and reductions
    const date = new Date();
    this.additions = createRecord(database, 'InventoryAdjustment', 'supplier_invoice', user, date);
    this.reductions = createRecord(database, 'InventoryAdjustment', 'supplier_credit', user, date);

    // Go through each item, add it to the appropriate transaction, then copy over the
    // batch quantities allocated by the transaction item
    this.items.forEach((stocktakeItem) => {
      // If no counted quantity was entered, set it to the snapshot quantity
      if (stocktakeItem.countedTotalQuantity === null) {
        stocktakeItem.countedTotalQuantity = stocktakeItem.snapshotTotalQuantity;
      }

      // Work out whether this should be in the additions or reductions transaction
      const difference = stocktakeItem.countedTotalQuantity - stocktakeItem.snapshotTotalQuantity;
      const transaction = difference >= 0 ? this.additions : this.reductions;

      // Create and add TransactionItem to the transaction
      const item = stocktakeItem.item;
      const transactionItem = createRecord(database, 'TransactionItem', transaction, item);

      // Set the transaction item's quantity, causing it to handle batch logic
      // and apply adjustments to inventory
      transactionItem.setTotalQuantity(database, Math.abs(difference));

      // Copy batch quantities from transaction item to the stocktake item
      stocktakeItem.applyBatchAdjustments(database, transactionItem);
      // Prune off any batches with 0 quantity that were unchanged
      stocktakeItem.pruneBatches(database);
      database.save('StocktakeItem', stocktakeItem);
    });

    // Set the stocktake finalise details
    this.finalisedBy = user;
    this.stocktakeDate = date;
    this.status = 'finalised';
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
