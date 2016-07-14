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
    // if no batches found with totalQuantity > 0, return null
    if (!earliestBatch) return null;

    this.batches.forEach((batch) => {
      if (batch.totalQuantity > 0 && batch.expiryDate < earliestBatch.expiryDate) {
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

  addBatch(itemBatch) {
    // If the batch is already in the item, we don't want to add it again
    if (this.batches.find(currentItemBatch => currentItemBatch.id === itemBatch.id)) return;
    this.batches.push(itemBatch);
  }

  toString() {
    return `${this.code} - ${this.name}`;
  }
}
