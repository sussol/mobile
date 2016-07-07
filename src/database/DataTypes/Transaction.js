import Realm from 'realm';
import {
  addLineToParent,
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
  addItemsFromMasterList() {
    if (!this.isCustomerInvoice) throw new Error(`Cannot add master lists to ${this.type}`);
    if (this.isFinalised) throw new Error('Cannot add items to a finalised transaction');
    if (this.otherParty && this.otherParty.masterList && this.otherParty.masterList.lines) {
      this.otherParty.masterList.lines.forEach(line => this.addItem(line.item));
    }
  }

  /**
   * Remove the given TransactionItem from this transaction, along with all the
   * associated lines.
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
   * Adds a TransactionLine, incorporating it into a matching TransactionItem. Will
   * create a new TransactionItem if none exists already.
   * @param {Realm}  database        The app wide local database
   * @param {object} transactionLine The TransactionLine to add to this Transaction
   */
  addLine(database, transactionLine) {
    addLineToParent(transactionLine, this, () =>
      database.create('TransactionItem', {
        id: generateUUID(),
        item: transactionLine.itemLine.item,
        transaction: this,
      })
    );
  }

  /**
   * Finalise this transaction, generating the associated item lines, linking them
   * to their items, and setting the status so that this transaction is locked down.
   * @param  {Realm}  database The app wide local database
   * @param  {object} user     The user who finalised this transaction
   * @return {none}
   */
  finalise(database, user) {
    if (this.type === 'supplier_invoice') { // If a supplier invoice, add item lines to inventory
      this.enteredBy = user;
      this.items.forEach((transactionItem) => {
        transactionItem.lines.forEach((transactionLine) => {
          const itemLine = transactionLine.itemLine;
          itemLine.packSize = transactionLine.packSize;
          itemLine.numberOfPacks = itemLine.numberOfPacks + transactionLine.numberOfPacks;
          itemLine.expiryDate = transactionLine.expiryDate;
          itemLine.batch = transactionLine.batch;
          itemLine.costPrice = transactionLine.costPrice;
          itemLine.sellPrice = transactionLine.sellPrice;
          database.save('ItemLine', itemLine);
          database.save('TransactionLine', transactionLine);
        });
      });
    }
    this.status = 'finalised';
  }
}
