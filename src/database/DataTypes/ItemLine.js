import Realm from 'realm';

export class ItemLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  set totalQuantity(quantity) {
    if (quantity < 0) throw new Error('Cannot set a negative item line quantity');
    this.numberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }
}
