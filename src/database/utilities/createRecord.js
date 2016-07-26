import { generateUUID } from './utilities';
import { getNextNumber as getSerialNumber } from './numberSequenceUtilities';
import { formatDateAndTime } from '../../utilities';

const SERIAL_NUMBER_SEQUENCES = {
  CUSTOMER_INVOICE: 'customer_invoice_serial_number',
  REQUISITION: 'requisition_serial_number',
  STOCKTAKE: 'stocktake_serial_number',
};
const { CUSTOMER_INVOICE, REQUISITION, STOCKTAKE } = SERIAL_NUMBER_SEQUENCES;

/**
 * Creates a record of the given type, taking care of linking
 * up everything that might need linking up, generating IDs, serial
 * numbers, current dates, and inserting sensible defaults.
 * @param  {Realm}  database App wide local database
 * @param  {string} type     The type of record to create (not 1:1 with schema types)
 * @param  {args}   ...args  Any specific arguments the record type will need
 * @return {object}          The created database record, all ready to use
 */
export function createRecord(database, type, ...args) {
  switch (type) {
    case 'CustomerInvoice':
      return createCustomerInvoice(database, ...args);
    case 'NumberSequence':
      return createNumberSequence(database, ...args);
    case 'NumberToReuse':
      return createNumberToReuse(database, ...args);
    case 'ItemBatch':
      return createItemBatch(database, ...args);
    case 'Requisition':
      return createRequisition(database, ...args);
    case 'RequisitionItem':
      return createRequisitionItem(database, ...args);
    case 'Stocktake':
      return createStocktake(database, ...args);
    case 'StocktakeItem':
      return createStocktakeItem(database, ...args);
    case 'StocktakeBatch':
      return createStocktakeBatch(database, ...args);
    case 'InventoryAdjustment':
      return createInventoryAdjustment(database, ...args);
    case 'TransactionItem':
      return createTransactionItem(database, ...args);
    case 'TransactionBatch':
      return createTransactionBatch(database, ...args);
    default:
      throw new Error(`Cannot create a record with unsupported type: ${type}`);
  }
}

// Creates a customer invoice (Transaction) and adds it to the customer (Name)
function createCustomerInvoice(database, customer, user) {
  const currentDate = new Date();
  const invoice = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getSerialNumber(database, CUSTOMER_INVOICE),
    entryDate: currentDate,
    confirmDate: currentDate, // Customer invoices always confirmed in mobile
    type: 'customer_invoice',
    status: 'confirmed', // Customer invoices always confirmed in mobile for easy stock tracking
    comment: '',
    otherParty: customer,
    enteredBy: user,
  });
  if (customer.useMasterList) invoice.addItemsFromMasterList(database);
  database.save('Transaction', invoice);
  customer.addTransaction(invoice);
  database.save('Name', customer);
  return invoice;
}

// Creates a new number sequence
function createNumberSequence(database, sequenceKey) {
  return database.create('NumberSequence', {
    id: generateUUID(),
    sequenceKey: sequenceKey,
  });
}

// Creates a number attached to a sequence
function createNumberToReuse(database, numberSequence, number) {
  const numberToReuse = database.create('NumberToReuse', {
    id: generateUUID(),
    numberSequence: numberSequence,
    number: number,
  });
  numberSequence.addNumberToReuse(numberToReuse);
}

// Creates a transaction representing an inventory adjustment, either up (isAddition = true)
// or down (isAddition = false)
function createInventoryAdjustment(database, user, date, isAddition) {
  return database.create('Transaction', {
    id: generateUUID(),
    serialNumber: '1',
    entryDate: date,
    confirmDate: date,
    type: isAddition ? 'supplier_invoice' : 'supplier_credit',
    status: 'confirmed',
    comment: '',
    enteredBy: user,
    otherParty: database.objects('Name').find((name) => name.type === 'inventory_adjustment'),
  });
}

// Creates a new empty ItemBatch and adds it to the item
function createItemBatch(database, item, batchString) {
  const itemBatch = database.create('ItemBatch', {
    id: generateUUID(),
    item: item,
    batch: batchString,
    packSize: 1,
    numberOfPacks: 0,
    costPrice: item.defaultPrice ? item.defaultPrice : 0,
    sellPrice: item.defaultPrice ? item.defaultPrice : 0,
  });
  item.addBatch(itemBatch);
  database.save('Item', item);
  return itemBatch;
}

// Creates a Requisition
function createRequisition(database, user) {
  const requisition = database.create('Requisition', {
    id: generateUUID(),
    serialNumber: getSerialNumber(database, REQUISITION),
    status: 'new',
    type: 'request',
    entryDate: new Date(),
    daysToSupply: 90, // 3 months
    enteredBy: user,
  });
  return requisition;
}

// Creates a RequisitionItem and adds it to the requisition.
function createRequisitionItem(database, requisition, item) {
  const existingRequisitionItem = requisition.items.find(requisitionItem =>
                                    requisitionItem.itemId === item.id);
  if (existingRequisitionItem) return existingRequisitionItem;

  const dailyUsage = item.dailyUsage;
  const requisitionItem = database.create('RequisitionItem', {
    id: generateUUID(),
    item: item,
    requisition: requisition,
    stockOnHand: item.totalQuantity,
    dailyUsage: dailyUsage,
    requiredQuantity: 0,
    comment: '',
    sortIndex: requisition.items.length + 1,
  });
  requisition.addItem(requisitionItem);
  database.save('Requisition', requisition);
  return requisitionItem;
}

// Creates a Stocktake
function createStocktake(database, user) {
  const date = new Date();
  const stocktake = database.create('Stocktake', {
    id: generateUUID(),
    serialNumber: getSerialNumber(database, STOCKTAKE),
    name: `Stocktake ${formatDateAndTime(date, 'slashes')}`,
    createdDate: date,
    stocktakeDate: date,
    status: 'suggested',
    comment: '',
    createdBy: user,
  });
  return stocktake;
}

// Creates a StocktakeItem and adds it to the Stocktake.
function createStocktakeItem(database, stocktake, item) {
  const stocktakeItem = database.create('StocktakeItem', {
    id: generateUUID(),
    item: item,
    stocktake: stocktake,
  });
  stocktake.items.push(stocktakeItem);
  database.save('Stocktake', stocktake);
  return stocktakeItem;
}

// Creates a StocktakeBatch and adds it to the StocktakeItem
function createStocktakeBatch(database, stocktakeItem, itemBatch) {
  const { numberOfPacks, packSize, expiryDate, batch, costPrice, sellPrice } = itemBatch;
  const stocktakeBatch = database.create('StocktakeBatch', {
    id: generateUUID(),
    stocktake: stocktakeItem.stocktake,
    itemBatch: itemBatch,
    snapshotNumberOfPacks: numberOfPacks,
    packSize: packSize,
    expiryDate: expiryDate,
    batch: batch,
    costPrice: costPrice,
    sellPrice: sellPrice,
    sortIndex: stocktakeItem.stocktake ? stocktakeItem.stocktake.numberOfBatches : 0,
  });
  stocktakeItem.addBatch(stocktakeBatch);
  database.save('StocktakeItem', stocktakeItem);
  return stocktakeBatch;
}

// Creates a TransactionBatch and adds it to the TransactionItem
function createTransactionBatch(database, transactionItem, itemBatch) {
  const { item, batch, expiryDate, packSize, costPrice, sellPrice } = itemBatch;
  const transactionBatch = database.create('TransactionBatch', {
    id: generateUUID(),
    itemId: item.id,
    itemName: item.name,
    itemBatch: itemBatch,
    batch: batch,
    expiryDate: expiryDate,
    packSize: packSize,
    numberOfPacks: 0,
    costPrice: costPrice,
    sellPrice: sellPrice,
    transaction: transactionItem.transaction,
    sortIndex: transactionItem.transaction ? transactionItem.transaction.numberOfBatches : 0,
  });
  transactionItem.addBatch(transactionBatch);
  database.save('TransactionItem', transactionItem);
  itemBatch.addTransactionBatch(transactionBatch);
  database.save('ItemBatch', itemBatch);
  return transactionBatch;
}

// Creates a TransactionItem and adds it to the Transaction
function createTransactionItem(database, transaction, item) {
  const existingTransactionItem = transaction.items.find(transactionItem =>
                                    transactionItem.itemId === item.id);
  if (existingTransactionItem) return existingTransactionItem;
  const transactionItem = database.create('TransactionItem', {
    id: generateUUID(),
    item: item,
    transaction: transaction,
  });
  transaction.addItem(transactionItem);
  database.save('Transaction', transaction);
  return transactionItem;
}
