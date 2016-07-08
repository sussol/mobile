import Realm from 'realm';

export class ItemLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  set totalQuantity(quantity) {
    if (quantity < 0) throw new Error('Cannot set a negative item line quantity');
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  setTotalQuantity(database, quantity) {
    this.totalQuantity = quantity;
  }

  toString() {
    return `${this.itemName} - Batch ${this.batch}`;
  }
}
