import Realm from 'realm';
import { getTotal } from '../utilities';

export class Item extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.lines, 'totalQuantity');
  }
}
