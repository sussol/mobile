import Realm from 'realm';

export class RequisitionLine extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
}
