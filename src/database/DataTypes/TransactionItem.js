import Realm from 'realm';

import { applyDifferenceToShortestBatch, getTotal } from '../utilities';

export class TransactionItem extends Realm.Object {

  destructor(database) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot delete an item from a finalised transaction');
    }
    this.lines.forEach(transactionLine => database.delete('TransactionLine', transactionLine));
  }

  get totalQuantity() {
    return getTotal(this.lines, 'totalQuantity');
  }

  get totalQuantitySent() {
    return getTotal(this.lines, 'totalQuantitySent');
  }

  get totalPrice() {
    return getTotal(this.lines, 'totalPrice');
  }

  // For customer invoices, return how much can be issued in total, accounting
  // for the fact that any issued in a confirmed customer invoice has already
  // been taken off the total
  get availableQuantity() {
    if (this.type === 'customer_invoice' &&
       (this.status === 'confirmed' ||
        this.status === 'finalised')) {
      return this.item.totalQuantity + this.totalQuantity;
    }
    return this.item.totalQuantity;
  }

  /**
   * Sets the quantity for the current item by applying the difference to the
   * shortest expiry batches possible. N.B. Supplier invoices do not take effect
   * on the rest of the stock until they are finalised, whereas customer invoices
   * immediately influence stock levels.
   * @param {double} quantity The total quantity to set across all lines
   */
  set totalQuantity(quantity) {
    const difference = quantity - this.totalQuantity; // Positive if new quantity is greater
    applyDifferenceToShortestBatch(this.lines, difference);
  }
}
