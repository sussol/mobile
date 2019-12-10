import Realm from 'realm';

/**
 * A transaction batch.
 *
 * @property  {string}       id
 * @property  {string}       itemId
 * @property  {string}       itemName
 * @property  {ItemBatch}    itemBatch
 * @property  {string}       batch
 * @property  {Date}         expiryDate
 * @property  {number}       packSize
 * @property  {number}       numberOfPacks
 * @property  {number}       numberOfPacksSent  For supplier invoices.
 * @property  {Transaction}  transaction
 * @property  {string}       note
 * @property  {number}       costPrice
 * @property  {number}       sellPrice
 * @property  {Name}         donor
 * @property  {number}       sortIndex
 */
export class TransactionBatch extends Realm.Object {
  /**
   * Delete transaction batch and associated item batch if can be safely removed.
   *
   * @param  {Realm}  database
   */
  destructor(database) {
    this.setTotalQuantity(database, 0); // Ensure reverting of any stock changes to item batches.

    // Can safely remove associated item batch if transaction batch was created by an external
    // supplier invoice.
    if (this.transaction.isExternalSupplierInvoice) {
      database.delete('ItemBatch', this.itemBatch);
    }
  }

  /**
   * Get total quantity of this batch.
   *
   * @return  {number}
   */
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  /**
   * Get item code associated with this transaction batch.
   *
   * @return  {string}
   */
  get itemCode() {
    return this.itemBatch.item.code;
  }

  /**
   * Get id of associated item batch.
   *
   * @return  {string}
   */
  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  /**
   * Set total quantity of this transaction batch.
   *
   * @param  {Realm}   database
   * @param  {number}  quantity
   */
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

  /**
   * Get total quantity of this transaction batch.
   *
   * @return  {number}
   */
  get totalQuantitySent() {
    // Calculate quantity as product of number of packs sent and pack size.
    return this.numberOfPacksSent * this.packSize;
  }

  /**
   * Get total price of this transaction batch.
   *
   * @return  {number}
   */
  get totalPrice() {
    if (!this.numberOfPacks) return 0;
    if (this.type === 'customer_invoice') {
      if (!this.sellPrice) return 0;
      return this.sellPrice * this.numberOfPacks;
    }
    // Must be a supplier invoice.
    if (!this.costPrice) return 0;
    return this.costPrice * this.numberOfPacks;
  }

  /**
   * Get the maximum amount of the given quantity that can be allocated to this batch.
   *
   * @param   {number}  quantity  Quantity to allocate (can be positive or negative).
   * @return  {number}
   */
  getAmountToAllocate(quantity) {
    // Max that can be removed is the total quantity currently in the transaction batch.
    if (quantity < 0) return Math.max(quantity, -this.totalQuantity);
    // For outgoing transactions, max that can be added is amount in item batch.
    if (this.transaction.isOutgoing) {
      return Math.min(quantity, this.itemBatch.totalQuantity);
    }
    // For supplier invoice, there is no maximum amount that can be added.
    return quantity;
  }

  /**
   * Get string representation of transaction batch.
   *
   * @return  {string}
   */
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
    numberOfPacksSent: { type: 'double', optional: true },
    transaction: 'Transaction',
    note: { type: 'string', optional: true },
    costPrice: 'double',
    sellPrice: 'double',
    donor: { type: 'Name', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};

export default TransactionBatch;
