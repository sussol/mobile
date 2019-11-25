/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { generateUUID } from 'react-native-database';

import { formatDateAndTime } from '../../utilities';
import { NUMBER_SEQUENCE_KEYS } from './constants';
import { generalStrings } from '../../localization';

// Get the next highest number in an existing number sequence.
export const getNextNumber = (database, sequenceKey) => {
  const numberSequence = getNumberSequence(database, sequenceKey);
  const number = numberSequence.getNextNumber(database);
  database.save('NumberSequence', numberSequence);
  return String(number);
};

// Put a number back into a sequence for reuse.
export const reuseNumber = (database, sequenceKey, number) => {
  const numberSequence = getNumberSequence(database, sequenceKey);
  numberSequence.reuseNumber(database, parseInt(number, 10));
  database.save('NumberSequence', numberSequence);
};

export const getNumberSequence = (database, sequenceKey) => {
  const sequenceResults = database
    .objects('NumberSequence')
    .filtered('sequenceKey == $0', sequenceKey);
  if (sequenceResults.length > 1) {
    throw new Error(`More than one ${sequenceKey} sequence`);
  }
  if (sequenceResults.length <= 0) {
    return createRecord(database, 'NumberSequence', sequenceKey);
  }
  return sequenceResults[0];
};

const createInsurancePolicy = (
  database,
  patient,
  policyNumberFamily,
  policyNumberPerson,
  type,
  discountRate,
  expiryDate,
  insuranceProvider
) => {
  const policy = database.create('InsurancePolicy', {
    id: generateUUID(),
    patient,
    policyNumberFamily,
    policyNumberPerson,
    type,
    discountRate,
    expiryDate,
    insuranceProvider,
  });

  database.save('InsurancePolicy', policy);
  return policy;
};

const createCashIn = (database, user, patient, amount) => {
  const customerCredit = createCustomerCredit(database, user, patient, -amount);
  const receipt = createReceipt(database, user, patient, amount);
  const receiptLine = createReceiptLine(database, receipt, customerCredit, amount);

  return [customerCredit, receipt, receiptLine];
};

const createReceipt = (database, user, patient, total) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const receipt = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'receipt',
    status: 'finalised',
    comment: '',
    otherParty: patient,
    enteredBy: user,
    total,
  });

  database.save('Transaction', receipt);
  return receipt;
};

const createReceiptLine = (database, receipt, linkedTransaction, total) => {
  const receiptLine = database.create('TransactionBatch', {
    id: generateUUID(),
    total,
    transaction: receipt,
    linkedTransaction,
    type: 'cash_in',
  });

  database.save('TransactionBatch', receiptLine);
  return receiptLine;
};

const createPayment = (database, user, patient, total) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const payment = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'payment',
    status: 'finalised',
    comment: '',
    otherParty: patient,
    enteredBy: user,
    total,
  });

  database.save('Transaction', payment);
  return payment;
};

const createPaymentLine = (database, payment, linkedTransaction, total) => {
  const receiptLine = database.create('TransactionBatch', {
    id: generateUUID(),
    total,
    transaction: payment,
    linkedTransaction,
    type: 'cash_out',
  });

  database.save('TransactionBatch', receiptLine);
  return receiptLine;
};

const createCustomerCredit = (database, user, patient, total) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const customerCredit = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'customer_credit',
    status: 'finalised',
    comment: '',
    otherParty: patient,
    enteredBy: user,
    total,
  });

  database.save('Transaction', customerCredit);
  return customerCredit;
};

const createCustomerCreditLine = (database, payment, total) => {
  const receiptLine = database.create('TransactionBatch', {
    id: generateUUID(),
    total,
    transaction: payment,
    type: 'cash_in',
    note: 'credit',
  });

  database.save('TransactionBatch', receiptLine);
  return receiptLine;
};

/**
 * Create a customer invoice associated with a given customer.
 *
 * @param   {Realm}        database
 * @param   {Name}         customer  Customer associated with invoice.
 * @return  {Transaction}
 */
const createCustomerInvoice = (database, customer, user, mode = 'store') => {
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const currentDate = new Date();
  const invoice = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'customer_invoice',
    // Mobile customer invoices are always 'confirmed' for easy stock tracking.
    status: 'confirmed',
    comment: '',
    otherParty: customer,
    enteredBy: user,
    mode,
  });

  database.save('Transaction', invoice);

  return invoice;
};

/**
 * Create a new number sequence.
 *
 * @param   {Realm}           database
 * @param   {string}          sequenceKey
 * @return  {NumberSequence}
 */
const createNumberSequence = (database, sequenceKey) =>
  database.create('NumberSequence', {
    id: generateUUID(),
    sequenceKey,
  });

/**
 * Create a number attached to a sequence.
 *
 * @param  {Realm}           database
 * @param  {NumberSequence}  numberSequence  Sequence to attach the number to.
 * @param  {number}          number
 */
const createNumberToReuse = (database, numberSequence, number) => {
  const numberToReuse = database.create('NumberToReuse', {
    id: generateUUID(),
    numberSequence,
    number,
  });

  numberSequence.addNumberToReuse(numberToReuse);
};

/**
 * Create a transaction representing an inventory adjustment.
 *
 * @param   {Realm}        database    Local database.
 * @param   {Name}         user        Currently logged in user.
 * @param   {Date}         date        Current date.
 * @param   {bool}         isAddition  If true, adjustment is an increase,
 *                                     else, adjustment is a decrease.
 * @return  {Transaction}
 */
const createInventoryAdjustment = (database, user, date, isAddition) => {
  const { INVENTORY_ADJUSTMENT_SERIAL_NUMBER } = NUMBER_SEQUENCE_KEYS;
  return database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, INVENTORY_ADJUSTMENT_SERIAL_NUMBER),
    entryDate: date,
    confirmDate: date,
    type: isAddition ? 'supplier_invoice' : 'supplier_credit',
    status: 'confirmed',
    comment: '',
    enteredBy: user,
    otherParty: database.objects('Name').find(name => name.type === 'inventory_adjustment'),
  });
};

/**
 * Create a new empty batch for a given item.
 *
 * @param  {Realm}      database
 * @param  {Item}       item         Item assocated with new batch.
 * @param  {string}     batchString
 * @return {ItemBatch}
 */
const createItemBatch = (database, item, batchString) => {
  // Handle cross-reference items.
  const { realItem } = item;

  const itemBatch = database.create('ItemBatch', {
    id: generateUUID(),
    item: realItem,
    batch: batchString,
    packSize: 1,
    numberOfPacks: 0,
    costPrice: realItem.defaultPrice ? realItem.defaultPrice : 0,
    sellPrice: realItem.defaultPrice ? realItem.defaultPrice : 0,
  });

  realItem.addBatch(itemBatch);
  database.save('Item', realItem);

  return itemBatch;
};

/**
 * Create a new requisition.
 *
 * @param   {Realm}        database
 * @param   {User}         user            User creating requisition.
 * @param   {Name}         values?  TODO: this param+description is wrong
 * @return  {Requisition}
 */
const createRequisition = (
  database,
  user,
  { otherStoreName, program, period, orderType = {}, monthsLeadTime = 0 }
) => {
  const { REQUISITION_REQUESTER_REFERENCE, REQUISITION_SERIAL_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const { name: orderTypeName, maxMOS, thresholdMOS } = orderType || {};
  const regimenData =
    program && program.parsedProgramSettings ? program.parsedProgramSettings.regimenData : null;
  const daysToSupply = ((monthsLeadTime || 0) + (maxMOS || 1)) * 30;

  const requisition = database.create('Requisition', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, REQUISITION_SERIAL_NUMBER),
    requesterReference: getNextNumber(database, REQUISITION_REQUESTER_REFERENCE),
    status: 'suggested',
    type: 'request',
    entryDate: new Date(),
    daysToSupply,
    enteredBy: user,
    otherStoreName,
    program,
    orderType: orderTypeName,
    thresholdMOS,
    period,
    customData: regimenData && JSON.stringify({ regimenData }),
  });

  if (period) {
    period.addRequisitionIfUnique(requisition);
    database.save('Period', period);
  }

  return requisition;
};

/**
 * Create a new requisition item.
 *
 * @param   {Database}        database
 * @param   {Requisition}     requisition  Parent requisition.
 * @param   {Item}            item         Item to add to requisition.
 * @param   {double}          dailyUsage   Daily usage of item.
 * @return  {RequisitionItem}
 */
const createRequisitionItem = (database, requisition, item, dailyUsage) => {
  // Handle cross reference items.
  const { realItem } = item;

  const requisitionItem = database.create('RequisitionItem', {
    id: generateUUID(),
    item: realItem,
    requisition,
    stockOnHand: realItem.totalQuantity,
    dailyUsage: dailyUsage || realItem.dailyUsage,
    requiredQuantity: 0,
    comment: '',
    sortIndex: requisition.items.length + 1,
  });

  requisition.addItem(requisitionItem);
  database.save('Requisition', requisition);

  return requisitionItem;
};

/**
 * Create a new stocktake.
 *
 * @param   {Realm}      database
 * @param   {User}       user             User creating the stocktake.
 * @param   {string}     stocktakeName    What to name the stocktake
 * @param   {Program}    program          Program record to associate with the stocktake
 * @return  {Stocktake}
 */
const createStocktake = (database, user, stocktakeName, program) => {
  const { STOCKTAKE_SERIAL_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const date = new Date();
  const serialNumber = getNextNumber(database, STOCKTAKE_SERIAL_NUMBER);
  const title = program ? program.name : generalStrings.stocktake;
  const defaultName = `${title} - ${formatDateAndTime(date, 'slashes')}`;
  return database.create('Stocktake', {
    id: generateUUID(),
    serialNumber,
    name: stocktakeName || defaultName,
    createdDate: date,
    stocktakeDate: date,
    status: 'suggested',
    comment: '',
    createdBy: user,
    program,
  });
};

/**
 * Create a new stocktake item.
 *
 * @param   {Realm}          database
 * @param   {Stocktake}      stocktake  Parent stocktake.
 * @param   {Item}           item       Real item to create stocktake item from.
 * @return  {StocktakeItem}
 */
const createStocktakeItem = (database, stocktake, item) => {
  // Handle cross reference items.
  const { realItem } = item;

  const stocktakeItem = database.create('StocktakeItem', {
    id: generateUUID(),
    item: realItem,
    stocktake,
  });

  stocktake.items.push(stocktakeItem);
  database.save('Stocktake', stocktake);

  return stocktakeItem;
};

/**
 * Create a new stocktake batch.
 *
 * @param   {Realm}          database
 * @param   {Item}           stocktakeItem  Batch item.
 * @param   {ItemBatch}      itemBatch      Item batch to associate with stocktake batch.
 * @return  {StocktakeBatch}
 */
const createStocktakeBatch = (database, stocktakeItem, itemBatch) => {
  const { numberOfPacks, packSize, expiryDate, batch, costPrice, sellPrice } = itemBatch;

  const stocktakeBatch = database.create('StocktakeBatch', {
    id: generateUUID(),
    stocktake: stocktakeItem.stocktake,
    itemBatch,
    snapshotNumberOfPacks: numberOfPacks,
    packSize,
    expiryDate,
    batch,
    costPrice,
    sellPrice,
    sortIndex: stocktakeItem.stocktake ? stocktakeItem.stocktake.numberOfBatches : 0,
  });

  stocktakeItem.addBatch(stocktakeBatch);
  database.save('StocktakeItem', stocktakeItem);

  return stocktakeBatch;
};

/**
 * Create a new supplier invoice.
 *
 * @param   {Realm}       database
 * @param   {Name}        supplier   Name of supplier being invoiced.
 * @param   {User}        enteredBy  User who creating invoice.
 * @return  {Transaction}
 */
const createSupplierInvoice = (database, supplier, user) => {
  const { SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const currentDate = new Date();

  const invoice = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, SUPPLIER_INVOICE_NUMBER),
    entryDate: currentDate,
    type: 'supplier_invoice',
    status: 'new',
    comment: '',
    otherParty: supplier,
    enteredBy: user,
  });

  database.save('Transaction', invoice);

  return invoice;
};

/**
 * Create a new transaction batch. When creating a TransactionBatch, this is coming from either
 * a) an external supplier or b) some adjustment during a stocktake. These must be stock ins.
 * @param   {Realm}             database
 * @param   {TransactionItem}   transactionItem  Batch item.
 * @param   {ItemBatch}         itemBatch        Item batch to associate with transaction batch.
 * @return  {TransactionBatch}
 */
const createTransactionBatch = (database, transactionItem, itemBatch, isAddition = true) => {
  const { item, batch, expiryDate, packSize, costPrice, sellPrice, donor } = itemBatch;
  const { transaction } = transactionItem || {};

  const transactionBatch = database.create('TransactionBatch', {
    id: generateUUID(),
    itemId: item.id,
    itemName: item.name,
    itemBatch,
    batch,
    expiryDate,
    packSize,
    numberOfPacks: 0,
    costPrice,
    sellPrice,
    donor,
    transaction,
    sortIndex: transaction?.numberOfBatches || 0,
    type: isAddition ? 'stock_in' : 'stock_out',
  });

  transactionItem.addBatch(transactionBatch);
  database.save('TransactionItem', transactionItem);
  itemBatch.addTransactionBatch(transactionBatch);
  database.save('ItemBatch', itemBatch);

  return transactionBatch;
};

/**
 * Create a new transaction item.
 *
 * @param   {Realm}            database
 * @param   {Transaction}      transaction  Parent transaction.
 * @param   {Item}             item         Real item to create transaction item from.
 * @return  {TransactionItem}
 */
const createTransactionItem = (database, transaction, item) => {
  // Handle cross reference items.
  const { realItem } = item;

  const transactionItem = database.create('TransactionItem', {
    id: generateUUID(),
    item: realItem,
    transaction,
  });

  transaction.addItem(transactionItem);
  database.save('Transaction', transaction);

  return transactionItem;
};

/**
 * Create a record of the given type, taking care of linkages, generating IDs, serial
 * numbers, current dates, and inserting sensible defaults.
 *
 * @param   {Realm}         database
 * @param   {string}        type      The type of record to create (not 1:1 with schema types).
 * @param   {args}          ...args   Any specific arguments the record type will need.
 * @return  {Realm.Object}            The new database record.
 */
export const createRecord = (database, type, ...args) => {
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
    case 'SupplierInvoice':
      return createSupplierInvoice(database, ...args);
    case 'InventoryAdjustment':
      return createInventoryAdjustment(database, ...args);
    case 'TransactionItem':
      return createTransactionItem(database, ...args);
    case 'TransactionBatch':
      return createTransactionBatch(database, ...args);
    case 'Receipt':
      return createReceipt(database, ...args);
    case 'ReceiptLine':
      return createReceiptLine(database, ...args);
    case 'Payment':
      return createPayment(database, ...args);
    case 'PaymentLine':
      return createPaymentLine(database, ...args);
    case 'CustomerCredit':
      return createCustomerCredit(database, ...args);
    case 'CustomerCreditLine':
      return createCustomerCreditLine(database, ...args);
    case 'InsurancePolicy':
      return createInsurancePolicy(database, ...args);
    case 'CashIn':
      return createCashIn(database, ...args);
    default:
      throw new Error(`Cannot create a record with unsupported type: ${type}`);
  }
};

export default createRecord;
