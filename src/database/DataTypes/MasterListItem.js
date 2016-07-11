import Realm from 'realm';

export class MasterListItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
}
