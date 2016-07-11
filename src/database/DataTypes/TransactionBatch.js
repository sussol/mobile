import Realm from 'realm';

export class TransactionBatch extends Realm.Object {

  destructor(database) {
    this.setTotalQuantity(database, 0); // Ensure it reverts any stock changes to item batches
  }

  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  get usage() {
    if (!this.transaction.isConfirmed && !this.transaction.isFinalised) return 0;
    switch (this.transaction.type) {
      case 'customer_invoice':
        return this.totalQuantity;
      case 'supplier_invoice':
      default:
        return 0;
    }
  }

  setTotalQuantity(database, quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot change quantity of batches in a finalised transaction');
    }

    const difference = quantity - this.totalQuantity;
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;

    if (this.transaction.isConfirmed) {
      if (this.transaction.isCustomerInvoice) {
        this.itemBatch.totalQuantity -= difference;
        database.save('ItemBatch', this.itemBatch);
      } else if (this.transaction.isSupplierInvoice) {
        this.itemBatch.totalQuantity += difference;
        database.save('ItemBatch', this.itemBatch);
      }
    }
  }

  get totalQuantitySent() {
    return this.numberOfPacksSent * this.packSize;
  }

  get totalPrice() {
    if (!this.numberOfPacks) return 0;
    if (this.type === 'customer_invoice') {
      if (!this.sellPrice) return 0;
      return this.sellPrice * this.numberOfPacks;
    }
    // Must be a supplier invoice
    if (!this.costPrice) return 0;
    return this.costPrice * this.numberOfPacks;
  }

  /**
   * Returns the maximum amount of the given quantity that can be allocated to this batch.
   * N.B. quantity may be positive or negative.
   * @param  {double} quantity Quantity to allocate (can be positive or negative)
   * @return {double}          The maximum that can be allocated
   */
  getAmountToAllocate(quantity) {
    // Max that can be removed is the total quantity currently in the transaction batch
    if (quantity < 0) return Math.max(quantity, -this.totalQuantity);
    // For customer invoice, max that can be added is amount in item batch
    if (this.transaction.isCustomerInvoice) return Math.min(quantity, this.itemBatch.totalQuantity);
    // For supplier invoice, there is no maximum amount that can be added
    return quantity;
  }

  toString() {
    const transactionType = this.isCustomerInvoice ? 'Customer Invoice' : 'Supplier Invoice';
    return `${this.itemBatch} in a ${transactionType}`;
  }

}
