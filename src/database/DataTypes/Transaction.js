import Realm from 'realm';
import {
  addBatchToParent,
  getTotal,
} from '../utilities';
import { createRecord } from '../createRecord';

export class Transaction extends Realm.Object {
  constructor() {
    super();
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
  }

  get isFinalised() {
    return this.status === 'finalised';
  }

  get isConfirmed() {
    return this.status === 'confirmed';
  }

  get isCustomerInvoice() {
    return this.type === 'customer_invoice';
  }

  get isSupplierInvoice() {
    return this.type === 'supplier_invoice';
  }

  get totalPrice() {
    return getTotal(this.items, 'totalPrice');
  }

  /**
   * Add a TransactionItem to this transaction, based on the given item. If it already
   * exists, do nothing.
   * @param {object} transactionItem  The TransactionItem to add
   */
  addItem(transactionItem) {
    if (this.items.find(testItem => testItem.item.id === transactionItem.item.id)) {
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
   * @param {Realm}  database        The app wide local database
   * @param {object} transactionBatch The TransactionBatch to add to this Transaction
   */
  addBatch(database, transactionBatch) {
    addBatchToParent(transactionBatch, this, () =>
      createRecord(database, 'TransactionItem', this, transactionBatch.itemBatch.item)
    );
  }

  /**
   * Finalise this transaction, generating the associated item batches, linking them
   * to their items, and setting the status so that this transaction is locked down.
   * @param  {Realm}  database The app wide local database
   * @param  {object} user     The user who finalised this transaction
   * @return {none}
   */
  finalise(database, user) {
    if (this.isFinalised) throw new Error('Cannot finalise as transaction is already finalised');
    if (this.type === 'supplier_invoice') { // If a supplier invoice, add item batches to inventory
      this.enteredBy = user;
      this.items.forEach((transactionItem) => {
        transactionItem.batches.forEach((transactionBatch) => {
          const itemBatch = transactionBatch.itemBatch;
          itemBatch.packSize = transactionBatch.packSize;
          itemBatch.numberOfPacks = itemBatch.numberOfPacks + transactionBatch.numberOfPacks;
          itemBatch.expiryDate = transactionBatch.expiryDate;
          itemBatch.batch = transactionBatch.batch;
          itemBatch.costPrice = transactionBatch.costPrice;
          itemBatch.sellPrice = transactionBatch.sellPrice;
          database.save('ItemBatch', itemBatch);
          database.save('TransactionBatch', transactionBatch);
        });
      });
    }
    if (!this.isConfirmed) this.confirmDate = new Date();
    this.status = 'finalised';
  }
}
