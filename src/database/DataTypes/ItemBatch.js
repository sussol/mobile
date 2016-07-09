import Realm from 'realm';

export class ItemBatch extends Realm.Object {
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
    if (quantity < 0) throw new Error('Cannot set a negative item batch quantity');
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  toString() {
    return `${this.itemName} - Batch ${this.batch}`;
  }
}
