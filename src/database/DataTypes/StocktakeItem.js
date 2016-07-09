import Realm from 'realm';

import { getTotal } from '../utilities';

export class StocktakeItem extends Realm.Object {
  get snapshotTotalQuantity() {
    return getTotal(this.lines, 'snapshotTotalQuantity');
  }

  get countedTotalQuantity() {
    return getTotal(this.lines, 'countedTotalQuantity');
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  /**
   * Sets the counted quantity for the current item by applying the difference to the
   * shortest expiry batches possible, i.e. increase => all to shortest expiry,
   * decrease => spread over shortest to expire batches until it is all accounted for.
   * @param {Realm}  database The app wide local database
   * @param {double} quantity The total quantity to set across all lines
   */
  setCountedNumberOfPacks() {
    // TODO - think about how this ties in with finalising stocktake and making
    // inventory adjustments
  }

}
