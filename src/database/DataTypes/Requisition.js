import Realm from 'realm';
import { createRecord, getTotal } from '../utilities';
import { complement } from 'set-manipulator';

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

  hasItemWithId(itemId) {
    return this.items.filtered('item.id == $0', itemId).length > 0;
  }

  // Adds a RequisitionItem to this Requisition
  addItem(requisitionItem) {
    this.items.push(requisitionItem);
  }

  addItemIfUnique(requisitionItem) {
    if (this.items.filtered('id == $0', requisitionItem.id).length > 0) return;
    this.addItem(requisitionItem);
  }

  /**
   * Add all items from the mobile store's master list to this requisition
   */
  addItemsFromMasterList(database, thisStore) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised requisition');
    if (thisStore.masterList && thisStore.masterList.items) {
      const itemsToAdd = complement(thisStore.masterList.items,
                                    this.items,
                                    (item) => item.itemId);
      itemsToAdd.forEach(masterListItem =>
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
