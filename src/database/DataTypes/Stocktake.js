/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { complement } from 'set-manipulator';

import { addBatchToParent, createRecord, getTotal } from '../utilities';

export class Stocktake extends Realm.Object {
  destructor(database) {
    if (this.isFinalised) {
      throw new Error('Cannot delete a finalised Stocktake');
    }
    database.delete('StocktakeItem', this.items);
  }

  // Add a stocktake batch and incorporate into a matching stocktake item.
  addBatchIfUnique(database, stocktakeBatch) {
    addBatchToParent(stocktakeBatch, this, () => {
      createRecord(database, 'StocktakeItem', this, stocktakeBatch.itemBatch.item);
    });
  }

  /**
   * Sets the stocktake items attached to this stocktake based on |itemIds|.
   *
   * @param   {Realm}  database  App database.
   * @param   {array}  itemIds   The ids of the items to include in this stocktake.
   * @return  {none}
   */
  setItemsByID(database, itemIds) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised stocktake');
    }

    // Delete any stocktake items not in the new array of ids.
    const itemsToRemove = complement(
      this.items,
      itemIds.map(itemId => {
        return { itemId };
      }),
      stocktakeItem => {
        return stocktakeItem.itemId;
      },
    );
    if (itemsToRemove && itemsToRemove.length > 0) {
      database.delete('StocktakeItem', itemsToRemove);
    }

    // Add a new stocktake item for each new item id not currently in the stocktake.
    const itemIdsToAdd = complement(
      itemIds,
      this.items.map(stocktakeItem => {
        return stocktakeItem.itemId;
      }),
    );

    const items = database.objects('Item');
    itemIdsToAdd.forEach(itemId => {
      // Find the matching database item and use it to create a stocktake item.
      const item = items.filtered('id == $0', itemId)[0];
      const stocktakeItem = createRecord(database, 'StocktakeItem', this, item);

      // Add all item batches currently in stock to the stocktake item as stocktake batches.
      item.batchesWithStock.forEach(itemBatch => {
        createRecord(database, 'StocktakeBatch', stocktakeItem, itemBatch);
      });
    });
  }

  get isConfirmed() {
    return this.status === 'confirmed';
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Get any stocktake items that have a batch that would cause a reduction larger than
   * the amount of available stock in inventory if it were finalised.
   *
   * @return  {array}  All stocktake items that have been reduced below minimum level.
   */
  get itemsBelowMinimum() {
    return this.items.filter(stocktakeItem => {
      return stocktakeItem.isReducedBelowMinimum;
    });
  }

  /**
   * Get all stocktake items where snapshot does not match stock on hand or the corresponding
   * item has any batch with stock with no corresponding stocktake batch.
   *
   * @return  {array}  Array of |StocktakeItem| representing all outdated stocktake items.
   */
  get itemsOutdated() {
    return this.items.filter(stocktakeItem => {
      return stocktakeItem.isOutdated;
    });
  }

  get hasSomeCountedItems() {
    return this.items.some(item => {
      return item.hasCountedBatches;
    });
  }

  get numberOfBatches() {
    return getTotal(this.items, 'numberOfBatches');
  }

  /**
   * Resets each item in |stocktakeItems|.
   *
   * @param  {Realm}  database        App database.
   * @param  {array}  stocktakeItems  Array of |StocktakeItem| to reset.
   */
  // eslint-disable-next-line class-methods-use-this
  resetStocktakeItems(database, stocktakeItems) {
    database.write(() => {
      stocktakeItems.forEach(stocktakeItem => {
        stocktakeItem.reset(database);
      });
    });
  }

  /**
   * Get or create reducing invoice for this stocktake.
   *
   * @param   {Realm}                database  App database.
   * @param   {User}                 user      The currently logged in user.
   * @return  {InventoryAdjustment}            Transaction for reduction.
   */
  getReductions(database) {
    if (!this.reductions) {
      this.reductions = createRecord(
        database,
        'InventoryAdjustment',
        this.finalisedBy,
        this.stocktakeDate,
        false,
      );
    }
    return this.reductions;
  }

  /**
   * Get or create increasing invoice for this stocktake.
   *
   * @param   {Realm}        database  App database.
   * @param   {User}         user      The currently logged on user.
   * @return  {Transaction}            Transaction for stock increase.
   */
  getAdditions(database) {
    if (!this.additions) {
      this.additions = createRecord(
        database,
        'InventoryAdjustment',
        this.finalisedBy,
        this.stocktakeDate,
        true,
      );
    }
    return this.additions;
  }

  /**
   * Finalises this stocktake and creates transactions to apply the stock changes to inventory.
   *
   * @param {Realm}         database  App database.
   * @param {Realm.Object}  user      The currently logged in user.
   */
  finalise(database, user) {
    if (this.isFinalised) {
      throw Error('Cannot finalise as stocktake already finalised');
    }
    if (this.itemsBelowMinimum.length > 0) {
      // Last check before ledger problems.
      throw Error('Attempt to finalise stocktake with adjustments that make item stock negative');
    }

    // Set the stocktake finalise details.
    this.finalisedBy = user;
    this.stocktakeDate = new Date();

    // Adjust stocktake inventory.
    this.adjustInventory(database, user);

    this.status = 'finalised';

    database.save('Stocktake', this);
  }

  /**
   * Applies differences in snapshot and counted quantities to the appropriate inventory
   * adjustment transactions.
   *
   * @param  {Realm}  database  App database.
   * @param  {User}   user      The user that finalised this stocktake.
   */
  adjustInventory(database) {
    // Prune any stocktake item that has not had a quantity change.
    database.delete(
      'StocktakeItem',
      this.items.filter(stocktakeItem => {
        return !stocktakeItem.hasCountedBatches;
      }),
    );

    // Get every batch associated with this stocktake.
    const stocktakeBatches = database
      .objects('StocktakeBatch')
      .filtered('stocktake.id = $0', this.id);

    // Delete each new stocktake batch that has been created by stocktake but has not been changed.
    database.delete(
      'StocktakeBatch',
      stocktakeBatches.filter(stocktakeBatch => {
        return stocktakeBatch.snapshotTotalQuantity === 0 && stocktakeBatch.difference === 0;
      }),
    );

    // |stocktakeBatch.finalise()| handles optimisation based on what fields were entered
    // (i.e. count/batch/expiry).
    stocktakeBatches.forEach(stocktakeBatch => {
      return stocktakeBatch.finalise(database);
    });
  }
}

export default Stocktake;

Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    createdDate: { type: 'date', default: new Date() }, // Includes time.
    stocktakeDate: { type: 'date', optional: true },
    status: { type: 'string', default: 'new' },
    createdBy: { type: 'User', optional: true },
    finalisedBy: { type: 'User', optional: true },
    comment: { type: 'string', optional: true },
    serialNumber: { type: 'string', default: 'placeholderSerialNumber' },
    items: { type: 'list', objectType: 'StocktakeItem' },
    additions: { type: 'Transaction', optional: true },
    reductions: { type: 'Transaction', optional: true },
  },
};
