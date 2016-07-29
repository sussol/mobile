import Realm from 'realm';

export class TransactionBatch extends Realm.Object {

  destructor(database) {
    this.setTotalQuantity(database, 0); // Ensure it reverts any stock changes to item batches
    this.itemBatch.removeTransactionBatch(this);
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
      case 'supplier_credit': // Don't include supplier credits as usage, may be discarding stock
      default:
        return 0;
    }
  }

  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  setTotalQuantity(database, quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot change quantity of batches in a finalised transaction');
    }

    const difference = quantity - this.totalQuantity;
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;

    if (this.transaction.isConfirmed) {
      const inventoryDifference = this.transaction.isIncoming ? difference : -difference;
      this.itemBatch.totalQuantity += inventoryDifference;
      database.save('ItemBatch', this.itemBatch);
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
    // For outgoing transactions, max that can be added is amount in item batch
    if (this.transaction.isOutgoing) return Math.min(quantity, this.itemBatch.totalQuantity);
    // For supplier invoice, there is no maximum amount that can be added
    return quantity;
  }

  toString() {
    return `${this.itemBatch} in a ${this.transaction.type}`;
  }

}

TransactionBatch.schema = {
  name: 'TransactionBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    itemId: 'string',
    itemName: 'string',
    itemBatch: 'ItemBatch',
    batch: 'string',
    expiryDate: { type: 'date', optional: true },
    packSize: 'double',
    numberOfPacks: 'double',
    numberOfPacksSent: { type: 'double', optional: true }, // For supplier invoices
    transaction: 'Transaction',
    note: { type: 'string', optional: true },
    costPrice: 'double',
    sellPrice: 'double',
    sortIndex: { type: 'int', optional: true },
  },
};
