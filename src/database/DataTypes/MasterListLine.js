import Realm from 'realm';

export class MasterListLine extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
}
