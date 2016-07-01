import Realm from 'realm';

export class TransactionLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  set totalQuantity(quantity) {
    this.numberOfPacks = quantity / this.packSize;
  }

  get totalQuantitySent() {
    return this.numberOfPacksSent * this.packSize;
  }

  get priceExtension() {
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
