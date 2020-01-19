/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
import { complement } from 'set-manipulator';

import { createRecord, getTotal } from '../utilities';
import { UIDatabase } from '..';

/**
 * A requisition.
 *
 * @property  {string}                  id
 * @property  {string}                  status
 * @property  {Name}                    otherStoreName
 * @property  {string}                  type                Type of requisition, valid values
 *                                                          are 'imprest', 'forecast', 'request',
 *                                                          'response'.
 * @property  {Date}                    entryDate
 * @property  {number}                  daysToSupply
 * @property  {string}                  serialNumber
 * @property  {string}                  requesterReference
 * @property  {string}                  comment
 * @property  {User}                    enteredBy
 * @property  {List.<RequisitionItem>}  items
 * @property  {Transaction}             linkedTransaction
 * @property  {MasterList}              program
 * @property  {Period}                  period
 * @property  {String}                  orderType
 */
export class Requisition extends Realm.Object {
  /**
   * Create a new requisition.
   */
  constructor() {
    super();
    this.removeItemsById = this.removeItemsById.bind(this);
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
    this.addItem = this.addItem.bind(this);
    this.setRequestedToSuggested = this.setRequestedToSuggested.bind(this);
  }

  /**
   * Delete requisition and associated requisition items/period.
   *
   * @param {Realm} database
   */
  destructor(database) {
    database.delete('RequisitionItem', this.items);
  }

  /**
   * Get if requisition is confirmed.
   *
   * @return  {boolean}
   */
  get isConfirmed() {
    return this.status === 'confirmed';
  }

  /**
   * Get if requisition is finalised.
   *
   * @return  {boolean}
   */
  get isFinalised() {
    return this.status === 'finalised';
  }

  /**
   * Get if requisition is a request.
   *
   * @return  {boolean}
   */
  get isRequest() {
    return this.type === 'request';
  }

  /**
   * Get name of user who entered requisition.
   *
   * @return  {string}
   */
  get enteredByName() {
    return this.enteredBy ? this.enteredBy.username : '';
  }

  /**
   * Get id of user who entered requisition.
   *
   * @return  {string}
   */
  get enteredById() {
    return this.enteredBy ? this.enteredBy.id : '';
  }

  /**
   * Get months to supply of requisition.
   *
   * @return  {number}
   */
  get monthsToSupply() {
    return this.daysToSupply / 30;
  }

  /**
   * Get the sum of required quantites for all items associated with requisition.
   *
   * @return  {number}
   */
  get totalRequiredQuantity() {
    return getTotal(this.items, 'requiredQuantity');
  }

  get numberOfOrderedItems() {
    const hasBeenCounted = requisitionItem => (requisitionItem.requiredQuantity !== 0 ? 1 : 0);
    return this.items.reduce((acc, item) => acc + hasBeenCounted(item), 0);
  }

  /**
   * Get number of items associated with requisition.
   *
   * @return  {number}
   */
  get numberOfItems() {
    return this.items.length;
  }

  get parsedCustomData() {
    return this.customData && JSON.parse(this.customData);
  }

  /**
   * Gets the other party (supplier or customer) name.
   * @return {String}
   */
  get otherPartyName() {
    return (this.otherStoreName && this.otherStoreName.name) || '';
  }

  /**
   * Get all indicators associated with this requisition.
   * @returns {Array.<ProgramIndicator>}
   */
  get indicators() {
    return this.program?.getActiveindicators();
  }

  /**
   * Set the days to supply of this requisition in months.
   *
   * @param  {number}  months
   */
  set monthsToSupply(months) {
    this.daysToSupply = months * 30;
  }

  // Saves a new customData string. Call inside a write/transaction
  // @data object matching shape of customData, it better be inclusive of EVERYTHING!
  saveCustomData(data) {
    this.customData = data && JSON.stringify({ ...data });
  }

  /**
   * Check whether requisition requests a given item.
   *
   * @param   {RequisitionItem}  item
   * @return  {boolean}
   */
  hasItem(item) {
    const itemId = item.realItem.id;
    return this.items.filtered('item.id == $0', itemId).length > 0;
  }

  /**
   * Add an item to requisition.
   *
   * @param  {RequisitionItem}  requisitionItem
   */
  addItem(requisitionItem) {
    this.items.push(requisitionItem);
  }

  /**
   * Add an item to requisition if it has not already been added.
   *
   * @param  {RequisitionItem}  requisitionItem
   */
  addItemIfUnique(requisitionItem) {
    if (this.items.filtered('id == $0', requisitionItem.id).length > 0) return;
    this.addItem(requisitionItem);
  }

  /**
   * Generate a customer invoice from this requisition.
   *
   * @param  {Realm}  database
   * @param  {User}   user
   */
  createCustomerInvoice(database, user) {
    if (this.isRequest || this.isFinalised) {
      throw new Error('Cannot create invoice from Finalised or Request Requistion ');
    }

    if (
      database.objects('Transaction').filtered('linkedRequisition.id == $0', this.id).length > 0
    ) {
      return;
    }

    const transaction = createRecord(database, 'CustomerInvoice', this.otherStoreName, user);
    this.items.forEach(requisitionItem =>
      createRecord(database, 'TransactionItem', transaction, requisitionItem.item)
    );
    transaction.linkedRequisition = this;
    this.linkedTransaction = transaction;
    transaction.comment = `From customer requisition ${this.serialNumber}`;
    database.save('Transaction', transaction);
  }

  /**
   * Add all items from the mobile store master list to this requisition.
   *
   * @param  {Realm}            database
   * @param  {Array.<string>}   selected masterlists from multiselect
   * @param  {Name}             thisStore
   */
  addItemsFromMasterList({ database, thisStore, selected }) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    // Filter through masterList ids that are on multiselect list
    const filteredMasterLists = selected
      ? thisStore.masterLists.filter(item => selected.indexOf(item.id) !== -1)
      : thisStore.masterLists;

    filteredMasterLists.forEach(masterList => {
      const itemsToAdd = complement(masterList.items, this.items, item => item.itemId);
      itemsToAdd.forEach(masterListItem => {
        if (!masterListItem.item.crossReferenceItem) {
          // Do not add cross reference items as causes unwanted duplicates.
          createRecord(database, 'RequisitionItem', this, masterListItem.item);
        }
      });
    });
  }

  /**
   * Add all items for the associated program.
   * @param {Realm} database
   */
  addItemsFromProgram(database) {
    if (this.isFinalized) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    this.program.items.forEach(masterListItem => {
      createRecord(database, 'RequisitionItem', this, masterListItem.item);
    });
  }

  /**
   * Add all items from the mobile store master list that require more stock.
   *
   * @param  {Realm}  database
   * @param  {Name}   thisStore
   */
  createAutomaticOrder(database, thisStore) {
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised requisition');
    }

    this.addItemsFromMasterList({ database, thisStore });
    this.setRequestedToSuggested(database);
    this.pruneRedundantItems(database);
  }

  /**
   * Remove items from requisition by id.
   *
   * @param  {Realm}           database
   * @param  {Array.<string>}  itemIds
   */
  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i += 1) {
      const requisitionItem = this.items.find(item => item.id === itemIds[i]);
      if (requisitionItem.isValid()) {
        itemsToDelete.push(requisitionItem);
      }
    }
    database.delete('RequisitionItem', itemsToDelete);
  }

  /**
   * Sets all requisition items requested quantities related to this requisition
   * to their suggested quantity.
   */
  setRequestedToSuggested(database) {
    if (!this.isRequest) {
      throw new Error('Cannot set the requested quantity of a response requisition');
    }

    this.items.forEach(requisitionItem => {
      requisitionItem.requiredQuantity = requisitionItem.suggestedQuantity;
      database.save('RequisitionItem', requisitionItem);
    });
  }

  /**
   * Sets all requisition items related to this requisition to their suggested quantity.
   *
   * RequisitionItem Throws an error if this requisition is finalised or is a request.
   */
  setSuppliedToSuggested() {
    this.items.forEach(requisitionItem => {
      const { suggestedQuantity } = requisitionItem;
      requisitionItem.setSuppliedQuantity(UIDatabase, suggestedQuantity);
    });
  }

  /**
   * Sets all requisition items supplied quantity, related to this requisition
   * to their requested/required quantity.
   *
   * RequisitionItem Throws an error if this requisition is finalised or is a request.
   */
  setSuppliedToRequested() {
    this.items.forEach(requisitionItem => {
      const { requiredQuantity } = requisitionItem;
      requisitionItem.setSuppliedQuantity(UIDatabase, requiredQuantity);
    });
  }

  /**
   * Delete any items associated with this requisition with a quantity of zero.
   *
   * @param  {Realm}  database
   */
  pruneRedundantItems(database) {
    const itemsToPrune = [];
    this.items.forEach(requisitionItem => {
      if (requisitionItem.requiredQuantity === 0) {
        itemsToPrune.push(requisitionItem);
      }
    });
    database.delete('RequisitionItem', itemsToPrune);
  }

  /**
   * Finalise this requisition.
   *
   * @param  {Realm}  database
   */
  finalise(database) {
    this.pruneRedundantItems(database);
    this.status = 'finalised';
    database.save('Requisition', this);

    if (this.linkedTransaction) this.linkedTransaction.finalise(database);
  }
}

Requisition.schema = {
  name: 'Requisition',
  primaryKey: 'id',
  properties: {
    id: 'string',
    status: { type: 'string', default: 'new' },
    orderType: { type: 'string', optional: true },
    thresholdMOS: { type: 'double', optional: true },
    type: { type: 'string', default: 'request' },
    entryDate: { type: 'date', default: new Date() },
    daysToSupply: { type: 'double', default: 30 },
    serialNumber: { type: 'string', default: '0' },
    requesterReference: { type: 'string', default: '' },
    comment: { type: 'string', optional: true },
    enteredBy: { type: 'User', optional: true },
    items: { type: 'list', objectType: 'RequisitionItem' },
    linkedTransaction: { type: 'Transaction', optional: true },
    program: { type: 'MasterList', optional: true },
    period: { type: 'Period', optional: true },
    otherStoreName: { type: 'Name', optional: true },
    customData: { type: 'string', optional: true },
  },
};

export default Requisition;
