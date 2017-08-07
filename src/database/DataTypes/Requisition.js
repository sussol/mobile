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

  destructor(database) {
    database.delete('RequisitionItem', this.items);
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

  get numberOfItems() {
    return this.items.length;
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
    thisStore.masterLists.forEach((masterList) => {
      const itemsToAdd = complement(masterList.items,
                                    this.items,
                                    (item) => item.itemId);
      itemsToAdd.forEach(masterListItem =>
        createRecord(database, 'RequisitionItem', this, masterListItem.item));
    });
  }

  /**
   * Add all items from the mobile store's master list that require more stock
   */
  createAutomaticOrder(database, thisStore) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised requisition');
    this.addItemsFromMasterList(database, thisStore);
    this.setRequestedToSuggested(database);
    this.pruneRedundantItems(database);
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

  /**
   * Delete any items that aren't contributing to this requisition, in order to
   * remove clutter
   * @param  {Realm} database   App wide local database
   * @return {none}
   */
  pruneRedundantItems(database) {
    const itemsToPrune = [];
    this.items.forEach((requisitionItem) => {
      if (requisitionItem.requiredQuantity === 0) itemsToPrune.push(requisitionItem);
    });
    database.delete('RequisitionItem', itemsToPrune);
  }

  finalise(database) {
    this.pruneRedundantItems(database);
    this.status = 'finalised';
  }
}

Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: { type: 'string', default: 'new' },
    type: { type: 'string', default: 'request' }, // imprest, forecast or request
    entryDate: { type: 'date', default: new Date() },
    daysToSupply: { type: 'double', default: 30 },
    serialNumber: { type: 'string', default: '0' },
    requesterReference: { type: 'string', default: '' },
    comment: { type: 'string', optional: true },
    enteredBy: { type: 'User', optional: true },
    items: { type: 'list', objectType: 'RequisitionItem' },
  },
};
