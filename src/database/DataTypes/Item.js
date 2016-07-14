import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.batches, 'totalQuantity');
  }

  get dailyUsage() {
    return getTotal(this.batches, 'dailyUsage');
  }

  get nearestExpiryDate() {
    if (this.batches.length === 0) return null;
    return this.batches.reduce((nearest, batch) =>
      nearest < batch.expiryDate && batch.expiryDate, 0);
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
