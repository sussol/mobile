import Realm from 'realm';

export class MasterList extends Realm.Object {
  addItem(masterListItem) {
    // If the item is already in the list, we don't want to add it again
    if (this.items.find(currentItem => currentItem.id === masterListItem.id)) return;
    this.items.push(masterListItem);
  }
}
