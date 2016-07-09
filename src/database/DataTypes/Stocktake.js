import Realm from 'realm';
import { addLineToParent, generateUUID } from '../utilities';
import { createStocktakeItem } from '../creators';


export class Stocktake extends Realm.Object {
  destructor(database) {
    if (this.isFinalised) throw new Error('Cannot delete a finalised Stocktake');
    database.delete('StocktakeItem', this.items);
  }

  // Adds a StocktakeLine, incorporating it into a matching StocktakeItem.
  addLine(database, stocktakeLine) {
    addLineToParent(stocktakeLine, this, () =>
      database.create('StocktakeItem', {
        id: generateUUID(),
        item: stocktakeLine.itemLine.item,
        stocktake: this,
      })
    );
  }

  setItemsByID(database, newItemsIds) {
    const items = database.objects('Item');
    this.items.forEach((stocktakeItem) => {
      const item = stocktakeItem.item;
      const itemIdIndex = newItemsIds.indexOf(item.id);
      // If an item in newItemsIds already exists in the stocktake, remove it from newItemsIds.
      if (itemIdIndex >= 0) {
        newItemsIds.slice(itemIdIndex, 1);
      }
      // If the item in the stocktake is not in the newItemsIds, remove it from the stocktake.
      if (!newItemsIds.some(id => id === item.id)) {
        database.delete('StocktakeItem', item);
      }
    });
    // Add StocktakeItem for each Item.id in newItemsIds to the stocktake.
    newItemsIds.forEach((itemId) => {
      const item = items.find(i => i.id === itemId);
      createStocktakeItem(database, this, item);
    });
  }

  // Adds a stocktakeItem to the stocktake corresponding to an Item.
  addItem(database, item) {
    if (this.isFinalised) throw new Error('Cannot add an item to a finalised stocktake');
    // Exit if item already in stocktake.
    if (this.items.find(stocktakeItem => stocktakeItem.item.id === item.id)) return;
    createStocktakeItem(database, this, item);
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
