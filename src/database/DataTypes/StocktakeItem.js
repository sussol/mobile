import Realm from 'realm';

import { applyDifferenceToShortestBatch, getTotal } from '../utilities';

export class StocktakeItem extends Realm.Object {
  get snapshotTotalQuantity() {
    return getTotal(this.lines, 'snapshotTotalQuantity');
  }

  get countedTotalQuantity() {
    return getTotal(this.lines, 'countedTotalQuantity');
  }

  /**
   * Sets the counted quantity for the current item by applying the difference to the
   * shortest expiry batches possible, i.e. increase => all to shortest expiry,
   * decrease => spread over shortest to expire batches until it is all accounted for.
   * @param {double} quantity The total quantity to set across all lines
   */
  set countedNumberOfPacks(quantity) {
    const difference = quantity - this.countedTotalQuantity; // Positive if new quantity greater
    applyDifferenceToShortestBatch(this.lines, difference); // TODO add save line so change syncs
  }

}
