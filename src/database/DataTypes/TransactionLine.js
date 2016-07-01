import Realm from 'realm';

export class TransactionLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  set totalQuantity(quantity) {
    if (this.transaction.isFinalised) {
      throw new Error('Cannot change quantity of lines in a finalised transaction');
    }

    this.numberOfPacks = quantity / this.packSize;

    if (this.transaction.isConfirmed) {
      if (this.transction.type === 'customer_invoice') {
        this.itemLine.totalQuantity = this.itemLine.totalQuantity - this.quantity;
      } else if (this.transaction.type === 'supplier_invoice') {
        this.itemLine.totalQuantity = this.itemLine.totalQuantity + this.quantity;
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

}
