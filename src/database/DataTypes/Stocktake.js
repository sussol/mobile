import Realm from 'realm';

export class Stocktake extends Realm.Object {
  getStocktakeLinesForItem(item) {
    return this.lines.filtered('itemLine.item.id == $0', item.id);
  }

  getSnapshotQuantityForItem(item) {
    const lines = this.getStocktakeLinesForItem(item);
    return lines.reduce((sum, line) => sum + line.totalQuantity, 0);
  }

  getCountedQuantityForItem(item) {
    const lines = this.getStocktakeLinesForItem(item);
    return lines.reduce((sum, line) => sum + line.countedQuantity, 0);
  }

/**
 * Sets the counted quantity for the given item by applying the difference to the
 * shortest expiry batches possible, i.e. increase => all to shortest expiry,
 * decrease => spread over shortest to expire batches until it is all accounted for.
 * @param {object} item     The item to set the quantity for
 * @param {double} quantity The total quantity to set across all lines
 */
  setCountedQuantityForItem(item, quantity) {
    let quantityToSubtract = this.getCountedQuantityForItem(item) - quantity;
    const lines = this.getStocktakeLinesForItem(item).sorted('expiryDate');
    const index = 0;
    while (quantityToSubtract !== 0 && index < lines.length) {
      const toSubtractFromThisLine = Math.min(quantityToSubtract, lines[index].totalQuantity);
      lines[index].totalQuantity = lines[index].totalQuantity - toSubtractFromThisLine;
      quantityToSubtract = quantityToSubtract - toSubtractFromThisLine;
    }
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
