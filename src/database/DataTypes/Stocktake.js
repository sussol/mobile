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
   * Returns the item attached to this stocktake with the item id supplied
   * @param  {string} itemId The item id to look for
   * @return {object}        The StocktakeItem with the matching item id
   */
  getItem(itemId) {
    return this.items.find(stocktakeItem => stocktakeItem.itemId === itemId);
  }

  /**
   * Finalises this stocktake, creating transactions to apply the stock changes to inventory
   * @param {Realm.Object}  user     The current user logged in
   * @param {Realm}         database App wide local database
   */
  finalise(database, user) {
    const date = new Date();
    const additionItems = [];
    const reductionItems = [];

    // Go through the stocktake items, adding each to either addition items or reduction items if
    // it was increased or decreased, otherwise setting the counted quantity to snapshot quantity
    this.items.forEach((stocktakeItem) => {
      if (stocktakeItem.countedTotalQuantity > stocktakeItem.snapshotTotalQuantity) {
        additionItems.push(stocktakeItem);
      } else if (stocktakeItem.countedTotalQuantity < stocktakeItem.snapshotTotalQuantity) {
        reductionItems.push(stocktakeItem);
      } else {
        // No change in stock, set counted quantity to snapshot quantity
        stocktakeItem.batches.forEach((stocktakeBatch) => {
          stocktakeBatch.countedTotalQuantity = stocktakeBatch.snapshotTotalQuantity;
        });
      }
    });

    // Adjust inventory
    this.additionTransaction = this.adjustInventory(database, user, additionItems, true);
    this.reductionTransaction = this.adjustInventory(database, user, reductionItems, false);

    // Set the stocktake finalise details
    this.finalisedBy = user;
    this.stocktakeDate = date;
    this.status = 'finalised';
  }

  /**
   * Create transaction for either additions or reductions, populate, confirm
   * it and copy the resulting batch adjustments over to this stocktake
   * @param  {Realm}   database       App wide database
   * @param  {object}  user           The user that finalised this stocktake
   * @param  {array}   stocktakeItems The items being either increased or decreased
   * @param  {date}    date           The date the stocktake was finalised
   * @param  {boolean} isAddition     Whether this is an addition (true) or reduction (false)
   * @return {[type]}                [description]
   */
  adjustInventory(database, user, stocktakeItems, date, isAddition) {
    const transactionType = isAddition ? 'supplier_invoice' : 'supplier_credit';

    if (stocktakeItems.length <= 0) return null;

    const transaction = createRecord(database, 'StockAdjustment', transactionType, user, date);

    stocktakeItems.forEach((stocktakeItem) => {
      // Create and add TransactionItem to the transaction
      const transactionItem = createRecord(
                                database, 'TransactionItem', transaction, stocktakeItem.item);
      transaction.addItem(transactionItem);
      transactionItem.totalQuantity = stocktakeItem.countedTotalQuantity;
    });

    // Confirm the transaction, causing it to handle batch logic and apply adjustments
    // to inventory
    transaction.confirm(database, user);

    // Copy batch quantities from transaction to the stocktake
    transaction.items.forEach((transactionItem) => {
      const stocktakeItem = this.getItem(transactionItem.itemId);
      stocktakeItem.applyBatchAdjustments(transactionItem, isAddition);
    });

    return transaction;
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
