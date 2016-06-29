import Realm from 'realm';

export class TransactionLine extends Realm.Object {
  get totalQuantity() {
    return this.numberOfPacks * this.packSize;
  }

  set totalQuantity(quantity) {
    this.numberOfPacks = quantity / this.packSize;
  }
}
