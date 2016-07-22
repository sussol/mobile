import Realm from 'realm';
import { createRecord, getTotal } from '../utilities';

export class Requisition extends Realm.Object {
  constructor() {
    super();
    this.removeItemsById = this.removeItemsById.bind(this);
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
    this.addItem = this.addItem.bind(this);
    this.setRequestedToSuggested = this.setRequestedToSuggested.bind(this);
  }

  get isConfirmed() {
    return this.status === 'confirmed';
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

  get monthsToSupply() {
    return this.daysToSupply / 30;
  }

  get totalRequiredQuantity() {
    return getTotal(this.items, 'requiredQuantity');
  }

  set monthsToSupply(months) {
    this.daysToSupply = months * 30;
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

  setRequestedToSuggested(database) {
    this.items.forEach(requisitionItem => {
      requisitionItem.requiredQuantity = requisitionItem.suggestedQuantity;
      database.save('RequisitionItem', requisitionItem);
    });
  }

  finalise() {
    this.status = 'finalised';
  }
}

Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: 'string',
    type: 'string', // imprest, forecast or request (request only used in mobile)
    entryDate: 'date',
    daysToSupply: 'double',
    serialNumber: 'string',
    enteredBy: { type: 'User', optional: true },
    items: { type: 'list', objectType: 'RequisitionItem' },
  },
};
