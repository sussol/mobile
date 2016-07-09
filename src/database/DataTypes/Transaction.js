import Realm from 'realm';
import {
  addBatchToParent,
  generateUUID,
  getTotal,
} from '../utilities';

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
   * @param {Realm}  database The app wide local database
   * @param {object} item     The Item to base the TransactionItem on
   */
  addItem(database, item) {
    if (this.isFinalised) throw new Error('Cannot add items to a finalised transaction');
    if (this.items.find(transactionItem => transactionItem.item.id === item.id)) return;
    const transactionItem = database.create('TransactionItem', {
      id: generateUUID(),
      item: item,
      transaction: this,
    });
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
                                                this.addItem(database, masterListItem.item));
    }
  }

  /**
   * Remove the given TransactionItem from this transaction, along with all the
   * associated batches.
   * @param  {[type]} database        [description]
   * @param  {[type]} transactionItem [description]
   * @return {none}
   */
  removeItem(database, transactionItem) {
    if (this.isFinalised) throw new Error('Cannot remove items from a finalised transaction');
    if (!this.items.find(item => transactionItem.id === item.id)) return;
    database.delete('TransactionItem', transactionItem);
  }

  /**
   * Adds a TransactionBatch, incorporating it into a matching TransactionItem. Will
   * create a new TransactionItem if none exists already.
   * @param {Realm}  database        The app wide local database
   * @param {object} transactionBatch The TransactionBatch to add to this Transaction
   */
  addBatch(database, transactionBatch) {
    addBatchToParent(transactionBatch, this, () =>
      database.create('TransactionItem', {
        id: generateUUID(),
        item: transactionBatch.itemBatch.item,
        transaction: this,
      })
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
    this.status = 'finalised';
  }
}
