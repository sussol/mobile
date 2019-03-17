import Realm from 'realm';

import { complement } from 'set-manipulator';

import { NUMBER_SEQUENCE_KEYS } from '../index';
import {
  addBatchToParent,
  createRecord,
  getTotal,
  reuseNumber as reuseSerialNumber,
} from '../utilities';

export class Transaction extends Realm.Object {
  constructor() {
    super();
    this.addItemsFromMasterList = this.addItemsFromMasterList.bind(this);
  }

  destructor(database) {
    if (this.isFinalised) {
      throw new Error('Cannot delete finalised transaction');
    }
    if (this.isCustomerInvoice) {
      reuseSerialNumber(database, NUMBER_SEQUENCE_KEYS.CUSTOMER_INVOICE_NUMBER, this.serialNumber);
    }
    if (this.isSupplierInvoice) {
      reuseSerialNumber(database, NUMBER_SEQUENCE_KEYS.SUPPLIER_INVOICE_NUMBER, this.serialNumber);
    }
    database.delete('TransactionItem', this.items);
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

  get isExternalSupplierInvoice() {
    return this.isSupplierInvoice && this.otherParty && this.otherParty.isExternalSupplier;
  }

  get isInternalSupplierInvoice() {
    return this.isSupplierInvoice && this.otherParty && this.otherParty.isInternalSupplier;
  }

  get isInventoryAdjustment() {
    return this.otherParty && this.otherParty.type === 'inventory_adjustment';
  }

  get otherPartyName() {
    return this.otherParty ? this.otherParty.name : '';
  }

  setOtherParty(name) {
    name.addTransaction(this);
    this.otherParty = name;
  }

  get totalPrice() {
    return getTotal(this.items, 'totalPrice');
  }

  get totalQuantity() {
    return getTotal(this.items, 'totalQuantity');
  }

  get numberOfBatches() {
    return getTotal(this.items, 'numberOfBatches');
  }

  get numberOfItems() {
    return this.items.length;
  }

  get isLinkedToRequisition() {
    return !!this.linkedRequisition;
  }

  hasItem(item) {
    const itemId = item.realItem.id;
    return this.items.filtered('item.id == $0', itemId).length > 0;
  }

  /**
   * Add an item to this transaction. If item already exists, do nothing.
   *
   * @param  {TransactionItem}  transactionItem  Item to add.
   */
  addItem(transactionItem) {
    this.items.push(transactionItem);
  }

  /**
   * Add all items from the customer's master list to this customer invoice.
   */
  addItemsFromMasterList(database) {
    if (!this.isCustomerInvoice) {
      throw new Error(`Cannot add master lists to ${this.type}`);
    }
    if (this.isFinalised) {
      throw new Error('Cannot add items to a finalised transaction');
    }
    if (this.otherParty) {
      this.otherParty.masterLists.forEach(masterList => {
        const itemsToAdd = complement(masterList.items, this.items, item => item.itemId);
        itemsToAdd.forEach(masterListItem => {
          if (!masterListItem.item.crossReferenceItem && masterListItem.item.isVisible) {
            // Do not add cross reference items as will cause duplicates.
            createRecord(database, 'TransactionItem', this, masterListItem.item);
          }
        });
      });
    }
  }

  /**
   * Remove items with the given ids from this transaction.
   *
   * @param   {Realm}  database  App database.
   * @param   {array}  itemIds   Ids corresponding to each item to remove.
   * @return  {none}
   */
  removeItemsById(database, itemIds) {
    const itemsToDelete = [];
    for (let i = 0; i < itemIds.length; i += 1) {
      const transactionItem = this.items.find(testItem => testItem.id === itemIds[i]);
      if (transactionItem.isValid()) {
        itemsToDelete.push(transactionItem);
      }
    }
    database.delete('transactionItem', itemsToDelete);
  }

  /**
   * Remove batches with given ids from this transaction. If any items now have no associated
   * batches, prune them.
   *
   * @param   {Realm}  database             App database.
   * @param   {array}  transactionBatchIds  Ids corresponding to each batch to remove.
   */
  removeTransactionBatchesById(database, transactionBatchIds) {
    if (this.isFinalised) {
      throw new Error('Cannot modify finalised transaction');
    }
    const transactionBatches = this.getTransactionBatches(database);
    const transactionBatchesToDelete = [];
    transactionBatchIds.forEach(transactionBatchId => {
      const transactionBatch = transactionBatches.find(
        matchTransactionBatch => matchTransactionBatch.id === transactionBatchId
      );
      transactionBatchesToDelete.push(transactionBatch);
    });
    database.delete('TransactionBatch', transactionBatchesToDelete);
    this.pruneBatchlessTransactionItems(database);
  }

  /**
   * Remove given item from transaction.
   *
   * @param   {Realm}            database         App database.
   * @param   {TransactionItem}  TransactionItem  Item to remove.
   */
  // eslint-disable-next-line class-methods-use-this
  removeTransactionItem(database, transactionItem) {
    database.delete('TransactionItem', transactionItem);
  }

  /**
   * Adds a batch to transaction, incorporating it into a matching item or creating a new
   * item if none already exist.
   *
   * @param  {Realm}             database          App database.
   * @param  {TransactionBatch}  transactionBatch  Batch to add to this transaction.
   */
  addBatchIfUnique(database, transactionBatch) {
    const { itemBatch } = transactionBatch;
    const { item } = itemBatch;

    addBatchToParent(transactionBatch, this, () => {
      return createRecord(database, 'TransactionItem', this, item);
    });
  }

  /**
   * Delete any batches and items that are not contributing to this transaction.
   *
   * @param  {Realm}  database  App database.
   */
  pruneRedundantBatchesAndItems(database) {
    const batchesToRemove = this.getTransactionBatches(database).filtered('numberOfPacks = 0');

    database.delete('TransactionBatch', batchesToRemove);
    this.pruneBatchlessTransactionItems(database);
  }

  /**
   * Delete any items with no 'transactionBatches'.
   *
   * @param  {Realm}  database  App database.
   */
  pruneBatchlessTransactionItems(database) {
    const itemsToRemove = [];
    this.items.forEach(transactionItem => {
      if (transactionItem.batches.length === 0) {
        itemsToRemove.push(transactionItem);
      }
    });
    database.delete('TransactionItem', itemsToRemove);
  }

  /**
   * Returns all transaction batches for this transaction as
   * a realm collection (can be filtered).
   *
   * @param   {Realm}            database  App database.
   * @return  {RealmCollection}            All transaction batches.
   */
  getTransactionBatches(database) {
    return database.objects('TransactionBatch').filtered('transaction.id == $0', this.id);
  }

  /**
   * Confirm this transaction, generating the associated item batches, linking them
   * to their items, and setting the status to confirmed.
   *
   * @param  {Realm}  database  App database.
   */
  confirm(database) {
    if (this.isConfirmed) {
      throw new Error('Cannot confirm as transaction is already confirmed');
    }
    if (this.isFinalised) {
      throw new Error('Cannot confirm as transaction is already finalised');
    }
    const isIncomingInvoice = this.isIncoming;

    this.getTransactionBatches(database).forEach(transactionBatch => {
      const {
        itemBatch,
        batch,
        packSize,
        numberOfPacks,
        expiryDate,
        costPrice,
        sellPrice,
      } = transactionBatch;

      // Pack to one all transactions in mobile, so multiply by |packSize| to get
      // quantity and price.
      const packedToOneQuantity = numberOfPacks * packSize;
      const packedToOneCostPrice = costPrice / packSize;
      const packedToOneSellPrice = sellPrice / packSize;

      const newNumberOfPacks = isIncomingInvoice
        ? itemBatch.numberOfPacks + packedToOneQuantity
        : itemBatch.numberOfPacks - packedToOneQuantity;
      itemBatch.packSize = 1;
      itemBatch.numberOfPacks = newNumberOfPacks;
      itemBatch.expiryDate = expiryDate;
      itemBatch.batch = this.adjustBatchName(batch);
      itemBatch.costPrice = packedToOneCostPrice;
      itemBatch.sellPrice = packedToOneSellPrice;
      database.save('ItemBatch', itemBatch);
    });

    this.confirmDate = new Date();
    this.status = 'confirmed';
  }

  /**
   * Get `supplierinvoice_{invoiceNumber}` of batch. Name is empty and
   * transaction is supplier invoice.
   *
   * @param   {string}  batchName
   * @return  {string}
   */
  adjustBatchName(batchName) {
    if (this.isSupplierInvoice && (!batchName || batchName === '')) {
      return `supplierinvoice_${this.serialNumber}`;
    }
    return batchName;
  }

  /**
   * Finalise this transaction, setting the status so that this transaction is
   * locked down. If it has not already been confirmed (i.e. adjustments to inventory
   * made), confirm it first.
   *
   * @param  {Realm}  database  App database.
   */
  finalise(database) {
    if (this.isFinalised) {
      throw new Error('Cannot finalise as transaction is already finalised');
    }
    // Prune all invoices except internal supplier invoices.
    if (!this.isInternalSupplierInvoice) {
      this.pruneRedundantBatchesAndItems(database);
    }
    if (!this.isConfirmed) this.confirm(database);

    this.status = 'finalised';
    database.save('Transaction', this);
  }
}

export default Transaction;

Transaction.schema = {
  name: 'Transaction',
  primaryKey: 'id',
  properties: {
    id: 'string',
    serialNumber: { type: 'string', default: 'placeholderSerialNumber' },
    otherParty: { type: 'Name', optional: true },
    comment: { type: 'string', optional: true },
    entryDate: { type: 'date', default: new Date() },
    type: { type: 'string', default: 'placeholderType' },
    status: { type: 'string', default: 'new' },
    confirmDate: { type: 'date', optional: true },
    enteredBy: { type: 'User', optional: true },
    theirRef: { type: 'string', optional: true }, // External reference code.
    category: { type: 'TransactionCategory', optional: true },
    items: { type: 'list', objectType: 'TransactionItem' },
    linkedRequisition: { type: 'Requisition', optional: true },
  },
};
