import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.batches, 'totalQuantity');
  }

  get dailyUsage() {
    return getTotal(this.batches, 'dailyUsage');
  }

  get earliestExpiryDate() {
    if (this.batches.length === 0) return null;
    return this.batches.reduce((earliest, batch) => {
      if (batch.totalQuantity !== 0 && earliest < batch.expiryDate) return earliest;
      return batch.expiryDate;
    }, this.batches[0]);
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
