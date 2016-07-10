import Realm from 'realm';

import { createRecord } from '../createRecord';

export class Requisition extends Realm.Object {
  constructor() {
    super();
    this.removeItemsById = this.removeItemsById.bind(this);
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  get enteredByName() {
    return this.enteredBy ? this.enteredBy.username : '';
  }

  get enteredById() {
    return this.enteredBy ? this.enteredBy.id : '';
  }

  // Adds a RequisitionItem to this Requisition
  addItem(requisitionItem) {
    this.items.push(requisitionItem);
  }

  /**
   * Add all items from the mobile store's master list to this requisition
   */
  addItemsFromMasterList(database, thisStore) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised requisition');
    if (thisStore.masterList && thisStore.masterList.items) {
      thisStore.masterList.items.forEach(masterListItem =>
        createRecord(database, 'RequisitionItem', this, masterListItem.item));
    }
  }

  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i++) {
      const requisitionItem = this.items.find(item => item.id === itemIds[i]);
      if (requisitionItem.isValid()) {
        itemsToDelete.push(requisitionItem);
      }
    }
    database.delete('RequisitionItem', itemsToDelete);
  }

  finalise() {
    this.status = 'finalised';
    // TODO behaviour when requisition is finalised
  }
}
