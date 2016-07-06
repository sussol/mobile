import Realm from 'realm';
import { addLineToParent, generateUUID } from '../utilities';

export class Stocktake extends Realm.Object {

  // Adds a StocktakeLine, incorporating it into a matching StocktakeItem
  addLine(database, stocktakeLine) {
    addLineToParent(stocktakeLine, this, () =>
      database.create('StocktakeItem', {
        id: generateUUID(),
        item: stocktakeLine.itemLine.item,
        stocktake: this,
      })
    );
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  finalise() {
    this.status = 'finalised';
    // TODO Apply stocktake to inventory
    // TODO Add finalisedBy user
  }

  /**
   * Will delete a StocktakeItem matching the provided Item from the database and from the items
   * property of the given stocktake. Will also delete from the database all StocktakeLines
   * belonging to the stocktakeItem.
   * @param {Realm}         database  The realm database to delete from.
   * @param {Realm.Object}  item      The object of type 'Item' to be removed from the stocktake.
   */
  deleteStocktakeItem(database, item) {
    if (this.isFinalised) throw new Error('Cannot delete from finalised Stocktake');
    const stocktakeItems = this.items;
    const stocktakeItem = stocktakeItems.find(i => i.item.id === item.id);
    database.delete('StocktakeLine', stocktakeItem.lines);
    database.delete('StocktakeItem', stocktakeItem);
    database.save('Stocktake', this);
  }
}
