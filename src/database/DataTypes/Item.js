import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.batches, 'totalQuantity');
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
