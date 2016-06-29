import Realm from 'realm';

export class ItemLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  set totalQuantity(quantity) {
    this.numberOfPacks = quantity / this.packSize;
  }
}
