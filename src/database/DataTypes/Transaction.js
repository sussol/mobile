import Realm from 'realm';
import {
  addBatchToParent,
  createRecord,
  getTotal,
  reuseNumber as reuseSerialNumber,
} from '../utilities';
import { SERIAL_NUMBER_KEYS } from '../index';

export class Transaction extends Realm.Object {
  constructor() {
    super();
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
  }

  destructor(database) {
    if (this.isCustomerInvoice) {
      reuseSerialNumber(database, SERIAL_NUMBER_KEYS.CUSTOMER_INVOICE, this.serialNumber);
    }
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  get isConfirmed() {
    return this.status === 'confirmed';
  }

  get isIncoming() {
    return this.type === 'supplier_invoice';
  }

  get isOutgoing() {
    return this.type === 'customer_invoice' || this.type === 'supplier_credit';
  }

  get isCustomerInvoice() {
    return this.type === 'customer_invoice';
  }

  get isSupplierInvoice() {
    return this.type === 'supplier_invoice';
  }

  get isInventoryAdjustment() {
    return this.otherParty && this.otherParty.type === 'inventory_adjustment';
  }

  get otherPartyName() {
    return this.otherParty ? this.otherParty.name : '';
  }

  get totalPrice() {
    return getTotal(this.items, 'totalPrice');
  }

  get totalQuantity() {
    return getTotal(this.items, 'totalQuantity');
  }

  /**
   * Add a TransactionItem to this transaction, based on the given item. If it already
   * exists, do nothing.
   * @param {object} transactionItem  The TransactionItem to add
   */
  addItem(transactionItem) {
    if (this.items.find(testItem => testItem.itemId === transactionItem.itemId)) {
      throw new Error('Should never add two of the same item to a transaction');
    }
    this.items.push(transactionItem);
  }

  /**
   * Add all items from the customer's master list to this customer invoice
   */
  addItemsFromMasterList(database) {
    if (!this.isCustomerInvoice) throw new Error(`Cannot add master lists to ${this.type}`);
    if (this.isFinalised) throw new Error('Cannot add items to a finalised transaction');
    if (this.otherParty && this.otherParty.masterList && this.otherParty.masterList.items) {
      this.otherParty.masterList.items.forEach(masterListItem =>
        createRecord(database, 'TransactionItem', this, masterListItem.item));
    }
  }

  /**
   * Remove the transaction items with the given ids from this transaction, along with all the
   * associated batches.
   * @param  {Realm}  database        App wide local database
   * @param  {array}  itemIds         The ids of transactionItems to remove
   * @return {none}
   */
  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i++) {
      const transactionItem = this.items.find(testItem => testItem.id === itemIds[i]);
      if (transactionItem.isValid()) {
        itemsToDelete.push(transactionItem);
      }
    }
    database.delete('transactionItem', itemsToDelete);
  }

  /**
   * Adds a TransactionBatch, incorporating it into a matching TransactionItem. Will
   * create a new TransactionItem if none exists already.
   * @param {Realm}  database         The app wide local database
   * @param {object} transactionBatch The TransactionBatch to add to this Transaction
   */
  addBatch(database, transactionBatch) {
    addBatchToParent(transactionBatch, this, () =>
      createRecord(database, 'TransactionItem', this, transactionBatch.itemBatch.item)
    );
  }

  /**
   * Confirm this transaction, generating the associated item batches, linking them
   * to their items, and setting the status to confirmed.
   * @param  {Realm}  database The app wide local database
   * @param  {object} user     The user who confirmed this transaction
   * @return {none}
   */
  confirm(database, user) {
    if (this.isConfirmed) throw new Error('Cannot confirm as transaction is already confirmed');
    this.enteredBy = user;
    this.items.forEach((transactionItem) => {
      transactionItem.batches.forEach((transactionBatch) => {
        const itemBatch = transactionBatch.itemBatch;
        const newNumberOfPacks = this.isIncoming ?
          itemBatch.numberOfPacks + transactionBatch.numberOfPacks
          : itemBatch.numberOfPacks - transactionBatch.numberOfPacks;

        itemBatch.packSize = transactionBatch.packSize;
        itemBatch.numberOfPacks = newNumberOfPacks;
        itemBatch.expiryDate = transactionBatch.expiryDate;
        itemBatch.batch = transactionBatch.batch;
        itemBatch.costPrice = transactionBatch.costPrice;
        itemBatch.sellPrice = transactionBatch.sellPrice;
        database.save('ItemBatch', itemBatch);
        database.save('TransactionBatch', transactionBatch);
      });
    });
    this.confirmDate = new Date();
    this.status = 'confirmed';
  }

  /**
   * Finalise this transaction, setting the status so that this transaction is
   * locked down. If it has not already been confirmed (i.e. adjustments to inventory
   * made), confirm it first
   * @param  {Realm}  database The app wide local database
   * @param  {object} user     The user who finalised this transaction
   * @return {none}
   */
  finalise(database, user) {
    if (this.isFinalised) throw new Error('Cannot finalise as transaction is already finalised');
    if (!this.isConfirmed) this.confirm(database, user); // Confirm first to adjust inventory
    this.status = 'finalised';
  }
}

Transaction.schema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    serialNumber: 'string',
    otherParty: { type: 'Name', optional: true },
    comment: { type: 'string', optional: true },
    entryDate: 'date',
    type: 'string',
    status: 'string',
    confirmDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    theirRef: { type: 'string', optional: true }, // An external reference code
    category: { type: 'TransactionCategory', optional: true },
    items: { type: 'list', objectType: 'TransactionItem' },
  },
};
