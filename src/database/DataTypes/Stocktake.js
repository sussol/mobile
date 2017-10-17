import Realm from 'realm';
import { complement } from 'set-manipulator';

import { addBatchToParent, createRecord, getTotal } from '../utilities';

export class Stocktake extends Realm.Object {
  destructor(database) {
    if (this.isFinalised) throw new Error('Cannot delete a finalised Stocktake');
    database.delete('StocktakeItem', this.items);
  }

  // Adds a StocktakeBatch, incorporating it into a matching StocktakeItem.
  addBatchIfUnique(database, stocktakeBatch) {
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
   * Get or create reducing invoice for this stocktake
   * @param {Realm}         database
   * @param {Realm.Object}  user     The current user logged in
   * @return {Realm.Object} Transaction for reduction
   */
  getReductions(database) {
    if (!this.reductions) {
      this.reductions = createRecord(database, 'InventoryAdjustment',
                                     this.finalisedBy, this.stocktakeDate, false);
    }
    return this.reductions;
  }

  /**
   * Get or create increasing invoice for this stocktake
   * @param {Realm}         database
   * @param {Realm.Object}  user     The current user logged in
   * @return {Realm.Object} Transaction for stock increase
   */
  getAdditions(database) {
    if (!this.additions) {
      this.additions = createRecord(database, 'InventoryAdjustment',
                                    this.finalisedBy, this.stocktakeDate, true);
    }
    return this.additions;
  }

  /**
   * Finalises this stocktake, creating transactions to apply the stock changes to inventory
   * @param {Realm}         database App wide local database
   * @param {Realm.Object}  user     The current user logged in
   */
  finalise(database, user) {
    // Set the stocktake finalise details
    this.finalisedBy = user;
    this.stocktakeDate = new Date();
    // Ajust stocktake inventory
    this.adjustInventory(database, user);

    this.status = 'finalised';
    database.save('Stocktake', this);
  }

  /**
   * Applies differences in snapshot and counted quantities to the appropriate inventory
   * adjustment transactions.
   * @param  {Realm}  database   App wide local database
   * @param  {object} user       The user that finalised this stocktake
   */
  adjustInventory(database) {
    // Get list of all StocktakeBatches associated with this stocktake
    const stocktakeBatches = database.objects('StocktakeBatch')
                             .filtered('stocktake.id = $0', this.id);
     // Delete all StocktakeBatches that have been created by stocktake
     // but have not been changed
    database.delete('StocktakeBatch', stocktakeBatches.filter(stocktakeBatch =>
      stocktakeBatch.snapshotTotalQuantity === 0 && stocktakeBatch.difference === 0));

    // Get all changed StocktakeBatches, and finalise them
    const changedStocktakeBatches = stocktakeBatches.filter(stocktakeBatch =>
                                                      stocktakeBatch.difference !== 0);
    changedStocktakeBatches.forEach((stocktakeBatch) => stocktakeBatch.finalise(database));
  }
}

Stocktake.schema = {
  name: 'Stocktake',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    createdDate: { type: 'date', default: new Date() }, // Includes time
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
