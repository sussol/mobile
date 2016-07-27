import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.batches, 'totalQuantity');
  }

  get dailyUsage() {
    return getTotal(this.batches, 'dailyUsage');
  }

  get earliestExpiringBatch() {
    if (this.batches.length === 0) return null;
    let earliestBatch = this.batches.find((batch) => batch.totalQuantity > 0);
    // If no batches found with totalQuantity > 0, return null
    if (!earliestBatch) return null;

    this.batches.forEach((batch) => {
      if (batch.totalQuantity > 0 &&
          batch.expiryDate &&
          batch.expiryDate < earliestBatch.expiryDate) {
        earliestBatch = batch;
      }
    });
    return earliestBatch;
  }

  get categoryName() {
    return this.category ? this.category.name : '';
  }

  get departmentName() {
    return this.department ? this.department.name : '';
  }

  get batchesWithStock() {
    return this.batches.filtered('numberOfPacks > 0');
  }

  addBatch(itemBatch) {
    this.batches.push(itemBatch);
  }

  addBatchIfUnique(itemBatch) {
    if (this.batches.filtered('id == $0', itemBatch.id).length > 0) return;
    this.addBatch(itemBatch);
  }

  toString() {
    return `${this.code} - ${this.name}`;
  }
}

Item.schema = {
  name: 'Item',
  primaryKey: 'id',
  properties: {
    id: 'string',
    code: 'string',
    name: 'string',
    defaultPackSize: 'double',
    batches: { type: 'list', objectType: 'ItemBatch' },
    department: { type: 'ItemDepartment', optional: true },
    description: { type: 'string', optional: true },
    category: { type: 'ItemCategory', optional: true },
    defaultPrice: { type: 'double', optional: true },
    isVisible: { type: 'bool', default: false },
  },
};
