import Realm from 'realm';

export class StocktakeLine extends Realm.Object {
  get snapshotTotalQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  get countedTotalQuantity() {
    return this.countedNumberOfPacks * this.packSize;
  }

  set countedTotalQuantity(quantity) {
    this.countedNumberOfPacks = quantity / this.packSize;
  }
}
