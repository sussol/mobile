import Realm from 'realm';

export class StocktakeLine extends Realm.Object {
  get snapshotQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  get countedQuantity() {
    return this.countedNumberOfPacks * this.packSize;
  }

  set countedQuantity(quantity) {
    this.countedNumberOfPacks = quantity / this.packSize;
  }
}
