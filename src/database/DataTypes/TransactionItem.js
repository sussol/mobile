import Realm from 'realm';

import { applyDifferenceToShortestBatch, generateUUID, getTotal } from '../utilities';

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
    const difference = quantity - this.totalQuantity; // Positive if new quantity is greater
    const saveLine = line => database.save('TransactionLine', line);
    let remainder = applyDifferenceToShortestBatch(this.lines, difference, saveLine);

    // For customer invoices create/delete transaction lines to match new quantity
    if (this.transaction.isCustomerInvoice) {
      if (difference < 0) { // Issuing less stock, may be able to remove lines
        this.lines.forEach(line => {
          if (line.totalQuantity === 0) database.delete('TransactionLine', line);
        });
      } else { // Issuing more stock, may need to add new lines
        // Go through lines in stock, adding as required
        for (let index = 0; index < this.item.lines.length && remainder !== 0; index += 1) {
          const itemLine = this.item.lines[index];
          // Skip if already in this TransactionItem
          if (this.lines.find(transactionLine => transactionLine.itemLine === item)) return;
          const { item, batch, expiryDate, packSize, costPrice, sellPrice } = itemLine;
          this.lines.push(database.create('TransactionLine', {
            id: generateUUID(),
            itemId: item.id,
            itemName: item.name,
            itemLine: itemLine,
            batch: batch,
            expiryDate: expiryDate,
            packSize: packSize,
            numberOfPacks: 0, // TODO
            costPrice: costPrice,
            sellPrice: sellPrice,
            transaction: this.transaction,
          }));
          remainder = applyDifferenceToShortestBatch(this.lines, remainder, saveLine);
        }
      }
    }
    if (remainder > 0) { // Something went wrong
      throw new Error(`Failed to allocate ${remainder} of quantity to TransactionItem`);
    }
  }
}
