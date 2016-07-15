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
   * Finalises this stocktake, creating transactions to apply the stock changes across the app.
   * @param {Realm.Object}  user  The User object representing the current user logged in.
   * @param {Realm}         database App wide local database
   */
  finalise(database, user) {
    const date = new Date();
    let additionTransaction;
    let reductionTransaction;
    const additionItems = [];
    const reductionItems = [];

    this.items.forEach((stocktakeItem) => {
      if (stocktakeItem.countedTotalQuantity > stocktakeItem.snapshotTotalQuantity) {
        additionItems.push(stocktakeItem);
      } else if (stocktakeItem.countedTotalQuantity < stocktakeItem.snapshotTotalQuantity) {
        reductionItems.push(stocktakeItem);
      } else {
        // No change in stock.
        stocktakeItem.batches.forEach((stocktakeBatch) => {
          stocktakeBatch.countedTotalQuantity = stocktakeBatch.snapshotTotalQuantity;
        });
      }
    });

    // Create transaction for additions, populate, finalise it and bind to this stocktake.
    if (additionItems.length > 0) {
      additionTransaction = createRecord(
        database, 'StockAdjustment', 'supplier_invoice', user, date);

      additionItems.forEach((stocktakeItem) => {
        // Create and add TransactionItem to the transaction
        const transactionItem = createRecord(
          database, 'TransactionItem', additionTransaction, stocktakeItem.item);
        additionTransaction.addItem(transactionItem);

        // Create and add TransactionBatch with changes corresponding to each StocktakeBatch.
        stocktakeItem.batches.forEach((StocktakeBatch) => {
          const transactionBatch = createRecord(
            database, 'TransactionBatch', additionTransaction, StocktakeBatch.item);
          // TODO: function that gets the max amount of difference and applies it in corresponding batches.
          additionTransaction.addBatch(transactionBatch);
        });
      });

      additionTransaction.finalise(database, user);
      this.additions = additionTransaction;
    }

    // Create transaction for reductions, populate, finalise it and bind to this stocktake.
    if (reductionItems.length > 0) {
      reductionTransaction = createRecord(
        database, 'StockAdjustment', 'supplier_credit', user, date);

      reductionItems.forEach((stocktakeItem) => {
        // TODO: Probably same solution as above, but this needs to make the transactionItems
        // and TransactionBatches to approriate items. Needs to update the stocktakeItem.batches
        // correct countedNumberOfPacks corresponding to the transactionBatches.
      });

      reductionTransaction.finalise(database, user);
      this.additions = reductionTransaction;
    }

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
