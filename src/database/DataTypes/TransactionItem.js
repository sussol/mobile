import Realm from 'realm';

import { generateUUID, getTotal } from '../utilities';

export class TransactionItem extends Realm.Object {

  destructor(database) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot delete an item from a finalised transaction');
    }
    this.lines.forEach(transactionLine => database.delete('TransactionLine', transactionLine));
  }

  get itemId() {
    return this.item ? this.item.id : '';
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
    if (this.transaction.isCustomerInvoice &&
       (this.transaction.isConfirmed ||
        this.transaction.isFinalised)) {
      return this.item.totalQuantity + this.totalQuantity;
    }
    return this.item.totalQuantity;
  }

  /**
   * Sets the quantity for the current item by applying the difference to the
   * shortest expiry batches possible.
   * N.B. For customer invoices, will create and delete transaction lines as appropriate.
   * N.B. Supplier invoices do not take effect on the rest of the stock until they
   * are finalised, whereas customer invoices immediately influence stock levels.
   * @param {double} quantity The total quantity to set across all lines
   */
  setTotalQuantity(database, quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot set quantity of an item in a finalised transaction');
    }
    if (quantity < 0) throw new Error('Cannot set a negative quantity on a transaction item');

    const difference = quantity - this.totalQuantity; // Positive if new quantity is greater

    // Apply the difference to make the new quantity
    let remainder = this.allocateDifferenceToBatches(database, difference);

    // For customer invoices create/delete transaction lines to match new quantity
    if (this.transaction.isCustomerInvoice) {
      // Go through item lines in stock, adding as required to get rid of remainder
      for (let index = 0; index < this.item.lines.length && remainder !== 0; index ++) {
        const itemLine = this.item.lines[index];

        // Skip if item line has no stock, or is already in this TransactionItem
        if (itemLine.totalQuantity <= 0 ||
          this.lines.find(transactionLine => transactionLine.itemLine === item)) continue;

        // Create the new transaction line
        const { item, batch, expiryDate, packSize, costPrice, sellPrice } = itemLine;
        this.lines.push(database.create('TransactionLine', {
          id: generateUUID(),
          itemId: item.id,
          itemName: item.name,
          itemLine: itemLine,
          batch: batch,
          expiryDate: expiryDate,
          packSize: packSize,
          numberOfPacks: 0,
          costPrice: costPrice,
          sellPrice: sellPrice,
          transaction: this.transaction,
        }));

        // Apply as much of the remainder to it as possible
        remainder = this.allocateDifferenceToBatches(database, remainder);
      }

      // See if any lines can be pruned, i.e. have 0 quantity for this invoice
      const linesToDelete = [];
      this.lines.forEach(line => {
        if (line.totalQuantity === 0) linesToDelete.push(line);
      });
      database.delete('TransactionLine', linesToDelete);
    }

    if (remainder > 0) { // Something went wrong
      throw new Error(`Failed to allocate ${remainder} of ${quantity} to ${this.item.name}`);
    }
  }

  /**
   * Applies the given difference in quantity to the appropriate batches. If the difference
   * is an increase, it will apply to the shortest expiry batches possible. If a reduction,
   * it will apply to the longest batches possible. In this way it is FEFO for customer invoices,
   * and pessimistic with changes to supplier invoices (assumes you got more of the shortest
   * batch or less of the longest batch.)
   * @param {Realm}      database      App wide local database
   * @param {double}     difference    The difference in quantity to set across all lines.
   *                                   Will be positive if greater new quantity, negative
   *                                   if lesser.
   * @return {double}    remainder     The difference not able to be applied to the lines
   *                                   passed in.
   */
  allocateDifferenceToBatches(database, difference) {
    let addQuantity = difference;

    // Sort lines shortest -> longest batch if increasing, longest -> shortest if reducing
    const lines = this.lines.sorted('expiryDate', difference < 0);

    // First apply as much of the quantity as possible to existing lines
    for (let index = 0; addQuantity !== 0 && index < lines.length; index++) {
      const lineAddQuantity = lines[index].getAmountToAllocate(addQuantity);
      lines[index].setTotalQuantity(database, lines[index].totalQuantity + lineAddQuantity);
      addQuantity -= lineAddQuantity;
      database.save('TransactionLine', lines[index]);
    }
    return addQuantity; // The remainder, not able to be allocated to the lines passed in
  }
}
