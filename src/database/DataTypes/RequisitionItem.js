import Realm from 'realm';

import { getTotal } from '../utilities';

export class RequisitionItem extends Realm.Object {
  get totalQuantity() {
    return getTotal(this.lines, 'totalQuantity');
  }
}
