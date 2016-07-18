import Realm from 'realm';

export class StocktakeBatch extends Realm.Object {
  get snapshotTotalQuantity() {
    return this.snapshotNumberOfPacks * this.packSize;
  }

  get countedTotalQuantity() {
    return this.countedNumberOfPacks * this.packSize;
  }

  get itemId() {
    if (!this.itemBatch) return '';
    return this.itemBatch.item ? this.itemBatch.item.id : '';
  }

  get itemBatchId() {
    return this.itemBatch ? this.itemBatch.id : '';
  }

  set countedTotalQuantity(quantity) {
    this.countedNumberOfPacks = this.packSize ? quantity / this.packSize : 0;
  }

  /**
   * Returns the maximum amount of the given quantity that can be allocated to this batch.
   * N.B. quantity may be positive or negative.
   * @param  {double} quantity Quantity to allocate (can be positive or negative)
   * @return {double}          The maximum that can be allocated
   */
  getAmountToAllocate(quantity) {
    // Max that can be removed is the total quantity currently in the associated item batch
    if (quantity < 0) return Math.max(quantity, -this.itemBatch.totalQuantity);
    // There is no maximum amount that can be added
    return quantity;
  }

  toString() {
    return `Stocktake batch representing ${this.itemBatch}`;
  }
}

StocktakeBatch.schema = {
  name: 'StocktakeBatch',
  primaryKey: 'id',
  properties: {
    id: 'string',
    stocktake: 'Stocktake',
    itemBatch: 'ItemBatch',
    snapshotNumberOfPacks: 'double',
    packSize: 'double',
    expiryDate: { type: 'date', optional: true },
    batch: 'string',
    costPrice: 'double',
    sellPrice: 'double',
    countedNumberOfPacks: { type: 'double', optional: true },
    sortIndex: { type: 'int', optional: true },
  },
};
