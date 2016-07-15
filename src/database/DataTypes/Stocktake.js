import Realm from 'realm';
import { addBatchToParent, generateUUID } from '../utilities';
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

  finalise() {
    this.status = 'finalised';
    // TODO Apply stocktake to inventory
    // TODO Add finalisedBy user
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
