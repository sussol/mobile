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
    const itemsToDelete = [];
    this.items.forEach(item => {
      const itemIndex = newItemsIds.indexOf(item.id);
      if (itemIndex < 0) itemsToDelete.push(item);
      newItemsIds.slice(itemIndex, 1);
    });
    database.delete('StocktakeItem', itemsToDelete);

    newItemsIds.forEach(itemId => {
      const itemResults = database.objects('Item').filtered('id == $0', itemId);
      if (itemResults && itemResults.length > 0) {
        const item = itemResults[0];
        this.items.push(createStocktakeItem(database, this, item));
      }
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
