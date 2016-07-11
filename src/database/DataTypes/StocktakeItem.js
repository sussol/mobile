import Realm from 'realm';

import { getTotal } from '../utilities';

export class StocktakeItem extends Realm.Object {
  destructor(database) {
    if (this.stocktake && this.stocktake.isFinalised) {
      throw new Error('Cannot delete a StocktakeItem belonging to a finalised stocktake');
    }
    database.delete('StocktakeBatch', this.batches);
  }

  get snapshotTotalQuantity() {
    return getTotal(this.batches, 'snapshotTotalQuantity');
  }

  get countedTotalQuantity() {
    return getTotal(this.batches, 'countedTotalQuantity');
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  /**
   * Sets the counted quantity for the current item by applying the difference to the
   * shortest expiry batches possible, i.e. increase => all to shortest expiry,
   * decrease => spread over shortest to expire batches until it is all accounted for.
   * @param {Realm}  database The app wide local database
   * @param {double} quantity The total quantity to set across all batches
   */
  setCountedNumberOfPacks() {
    // TODO - think about how this ties in with finalising stocktake and making
    // inventory adjustments
  }
}
