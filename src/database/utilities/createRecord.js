/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import moment from 'moment';
import { generateUUID } from 'react-native-database';

import { UIDatabase } from '..';
import { versionToInteger, formatDateAndTime } from '../../utilities';
import { NUMBER_SEQUENCE_KEYS } from './constants';
import { generalStrings } from '../../localization';
import { SETTINGS_KEYS } from '../../settings';

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

const createInsurancePolicy = (database, policyValues) => {
  const {
    patient,
    policyNumberFamily,
    policyNumberPerson,
    type,
    discountRate,
    insuranceProvider,
  } = policyValues;

  const expiryDate = moment(new Date())
    .add(insuranceProvider.validityDays, 'days')
    .toDate();

  const policy = database.create('InsurancePolicy', {
    id: generateUUID(),
    discountRate,
    patient,
    policyNumberFamily,
    policyNumberPerson,
    type,
    expiryDate,
    insuranceProvider,
  });

  database.save('InsurancePolicy', policy);
  return policy;
};

const createAddress = (database, { line1, line2, line3, line4, zipCode } = {}) =>
  database.create('Address', {
    id: generateUUID(),
    line1,
    line2,
    line3,
    line4,
    zipCode,
  });

/**
 * Creates a prescriber record. prescriberDetails can have the shape:
 * {
 *     firstName, lastName, registrationCode, line1, line2, isVisible,
 *     isActive, phoneNumber, mobileNumber, emailAddress
 * }
 */
const createPrescriber = (database, prescriberDetails) => {
  const { addressOne, addressTwo } = prescriberDetails;
  const address = createAddress(database, { line1: addressOne, line2: addressTwo });

  const prescriber = database.create('Prescriber', {
    id: generateUUID(),
    ...prescriberDetails,
    address,
    // Defaults:
    fromThisStore: true,
    isVisible: true,
    isActive: true,
  });

  database.save('Prescriber', prescriber);
};

/**
 * Creates a patient record. Patient details passed can be in the shape:
 *  {
 *    firstName, lastName, dateOfBirth, code, emailAddress,
 *    phoneNumber, addressOne, addressTwo, country
 *  }
 */
const createPatient = (database, patientDetails) => {
  const { PATIENT_CODE } = NUMBER_SEQUENCE_KEYS;
  const { dateOfBirth, addressOne, addressTwo, lastName, firstName } = patientDetails;

  const billingAddress = createAddress(database, { line1: addressOne, line2: addressTwo });

  const thisStoreId = database.getSetting(SETTINGS_KEYS.THIS_STORE_ID);
  const thisStoreCode = database.getSetting(SETTINGS_KEYS.THIS_STORE_CODE);
  const patientSequenceNumber = getNextNumber(database, PATIENT_CODE);
  const uniqueCode = `${thisStoreCode}${String(patientSequenceNumber)}`;

  const fullName = `${lastName}, ${firstName}`;

  const patient = database.create('Name', {
    id: generateUUID(),
    ...patientDetails,
    billingAddress,
    dateOfBirth,
    isVisible: true,
    isPatient: true,
    type: 'patient',
    code: uniqueCode,
    supplyingStoreId: thisStoreId,
    isCustomer: true,
    thisStoresPatient: true,
    name: fullName,
  });

  database.save('Patient', patient);
};

const createCashOut = (database, user, cashTransaction) => {
  const { name, amount, paymentType, reason, description } = cashTransaction;

  // Create payment transaction.
  const payment = createPayment(database, user, name, amount, paymentType, reason, description);

  // Create customer invoice of same monetary value to offset payment transaction.
  const customerInvoice = createOffsetCustomerInvoice(database, payment);

  // Create payment transaction batch.
  const paymentLine = createPaymentLine(database, payment, customerInvoice, amount);

  return [payment, customerInvoice, paymentLine];
};

const createCashIn = (database, user, cashTransaction) => {
  const { name, amount, paymentType, description } = cashTransaction;

  // Create receipt transaction.
  const receipt = createReceipt(database, user, name, amount, paymentType, description);

  // Create customer credit transaction.
  const customerCredit = createOffsetCustomerCredit(database, receipt);

  // Create receipt transaction batch.
  const receiptLine = createReceiptLine(database, receipt, customerCredit, amount);

  return [receipt, customerCredit, receiptLine];
};

const createOffsetCustomerInvoice = (database, payment) => {
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

  const currentDate = new Date();
  const invoice = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'customer_invoice',
    status: 'finalised',
    comment: 'Offset for a cash-only transaction',
    otherParty: payment.otherParty,
    subtotal: payment.subtotal,
    outstanding: payment.subtotal,
    enteredBy: payment.enteredBy,
    paymentType: payment?.paymentType,
  });

  return invoice;
};

const createReceipt = (database, user, name, amount, paymentType, description) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const receipt = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'receipt',
    status: 'finalised',
    comment: description,
    otherParty: name,
    enteredBy: user,
    subtotal: amount,
    paymentType,
  });

  database.save('Transaction', receipt);
  return receipt;
};

const createReceiptLine = (database, receipt, linkedTransaction, amount, note) => {
  const receiptLine = database.create('TransactionBatch', {
    id: generateUUID(),
    total: amount,
    transaction: receipt,
    linkedTransaction,
    type: 'cash_in',
    note,
  });

  database.save('TransactionBatch', receiptLine);
  return receiptLine;
};

const createPayment = (database, user, name, amount, paymentType, reason, description) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;
  const payment = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'payment',
    status: 'finalised',
    otherParty: name,
    enteredBy: user,
    subtotal: amount,
    option: reason,
    comment: description,
    paymentType,
  });

  database.save('Transaction', payment);
  return payment;
};

const createPaymentLine = (database, payment, invoice, amount) => {
  const receiptLine = database.create('TransactionBatch', {
    id: generateUUID(),
    total: amount,
    transaction: payment,
    linkedTransaction: invoice,
    type: 'cash_out',
  });

  database.save('TransactionBatch', receiptLine);
  return receiptLine;
};

const createSupplierCreditLine = (database, supplierCredit, itemBatch, returnAmount) => {
  // Create a TransactionITem to link between the new TransactionBatch and Transaction.
  const transactionItem = createTransactionItem(
    database,
    supplierCredit,
    itemBatch.item,
    -returnAmount
  );

  // Create a TransactionBatch for the return amount
  const transactionBatch = createTransactionBatch(database, transactionItem, itemBatch, false);

  // Adjust the TransactionBatch total to the negative amount of the original cost.
  transactionBatch.total = -transactionBatch.sellPrice * returnAmount;
  transactionBatch.numberOfPacks = returnAmount;
  database.save('TransactionBatch', transactionBatch);

  // Adjust the quantity of the underlying ItemBatch.
  itemBatch.totalQuantity -= returnAmount;
  database.save('ItemBatch', itemBatch);
};

const createSupplierCredit = (database, user, supplierId, returnAmount) => {
  const currentDate = new Date();
  const { SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

  // Create a supplier credit transaction with the negative of the sum of all
  // the batches to be returned.
  const supplierCredit = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, SUPPLIER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'supplier_credit',
    status: 'finalised',
    comment: '',
    otherParty: database.get('Name', supplierId),
    subtotal: returnAmount,
    enteredBy: user,
  });

  return supplierCredit;
};

const createOffsetCustomerCredit = (database, receipt) => {
  const currentDate = new Date();
  const { CUSTOMER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

  const customerCredit = database.create('Transaction', {
    id: generateUUID(),
    serialNumber: getNextNumber(database, CUSTOMER_INVOICE_NUMBER),
    entryDate: currentDate,
    confirmDate: currentDate,
    type: 'customer_credit',
    status: 'finalised',
    comment: 'Offset for a cash-only transaction',
    otherParty: receipt.otherParty,
    enteredBy: receipt.enteredBy,
    subtotal: -receipt.subtotal,
    outstanding: -receipt.subtotal,
    paymentType: receipt?.paymentType,
  });

  database.save('Transaction', customerCredit);
  return customerCredit;
};

const createCustomerRefundLine = (database, customerCredit, transactionBatch) => {
  const { total, itemBatch, numberOfPacks } = transactionBatch;
  const { item, batch, expiryDate, packSize, costPrice, sellPrice, donor } = itemBatch;

  const inverseTotal = -total;

  const refundLine = database.create('TransactionBatch', {
    id: generateUUID(),
    item,
    batch,
    expiryDate,
    packSize,
    costPrice,
    sellPrice,
    donor,
    itemBatch,
    transaction: customerCredit,
    total: inverseTotal,
    type: 'stock_in',
    note: 'credit',
  });

  customerCredit.outstanding += inverseTotal;

  itemBatch.addTransactionBatch(refundLine);
  refundLine.setTotalQuantity(database, numberOfPacks);

  database.save('Transaction', customerCredit);
  database.save('TransactionBatch', refundLine);
  database.save('ItemBatch', customerCredit);

  return refundLine;
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
  const alreadyReusing = database
    .objects('NumberToReuse')
    .filtered('numberSequence == $0 && number == $1', numberSequence, number);

  // If we are already reusing this number - shortcut return
  if (alreadyReusing.length) return;

  const numberToReuse = database.create('NumberToReuse', {
    id: generateUUID(),
    numberSequence,
    number,
  });

  numberSequence.addNumberToReuse(numberToReuse);
};

const createIndicatorValue = (database, row, column, period) => {
  const { defaultValue: value } = column;
  const indicatorValue = database.create('IndicatorValue', {
    id: generateUUID(),
    storeId: UIDatabase.getSetting(SETTINGS_KEYS.THIS_STORE_NAME_ID),
    row,
    column,
    period,
    _value: value,
  });
  row.addIndicatorValue(indicatorValue);
  column.addIndicatorValue(indicatorValue);
  return indicatorValue;
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
const createItemBatch = (database, item, batchString, supplier) => {
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
    supplier,
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
const createRequisitionItem = (database, requisition, item, dailyUsage, stockOnHand) => {
  // Handle cross reference items.
  const { realItem } = item;

  const requisitionItem = database.create('RequisitionItem', {
    id: generateUUID(),
    item: realItem,
    requisition,
    stockOnHand: stockOnHand ?? realItem.totalQuantity,
    dailyUsage: dailyUsage ?? realItem.dailyUsage,
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
  const { numberOfPacks, supplier, packSize, expiryDate, batch, costPrice, sellPrice } = itemBatch;

  const stocktakeBatch = database.create('StocktakeBatch', {
    id: generateUUID(),
    stocktake: stocktakeItem.stocktake,
    itemBatch,
    snapshotNumberOfPacks: numberOfPacks,
    supplier,
    packSize,
    expiryDate,
    batch,
    costPrice,
    sellPrice,
    sortIndex: (stocktakeItem?.stocktake?.numberOfBatches || 0) + 1 || 1,
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
  const { transaction, note } = transactionItem || {};

  const transactionBatch = database.create('TransactionBatch', {
    id: generateUUID(),
    itemId: item.id,
    itemName: item.name,
    itemBatch,
    batch,
    note,
    expiryDate,
    packSize,
    numberOfPacks: 0,
    costPrice,
    sellPrice,
    donor,
    transaction,
    type: isAddition ? 'stock_in' : 'stock_out',
    sortIndex: (transactionItem?.transaction?.numberOfBatches || 0) + 1 || 1,
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
const createTransactionItem = (database, transaction, item, initialQuantity = 0) => {
  // Handle cross reference items.
  const { realItem } = item;

  const transactionItem = database.create('TransactionItem', {
    id: generateUUID(),
    item: realItem,
    transaction,
  });

  const { isFinalised } = transaction;
  if (!isFinalised) transactionItem.setTotalQuantity(database, initialQuantity);

  transaction.addItem(transactionItem);
  database.save('Transaction', transaction);

  return transactionItem;
};

const createLocation = (database, locationType, description, code) => {
  const location = database.create('Location', {
    id: generateUUID(),
    description,
    code,
    locationType,
  });

  return location;
};

const createSensor = (database, macAddress, batteryLevel) => {
  const sensor = database.create('Sensor', {
    id: generateUUID(),
    macAddress,
    batteryLevel,
  });

  return sensor;
};

const createLocationMovement = (database, itemBatch, location) => {
  const locationMovement = database.create('LocationMovement', {
    id: generateUUID(),
    itemBatch,
    location,
    enterTimestamp: new Date(),
  });

  itemBatch.location = location;
  database.save('ItemBatch', itemBatch);

  return locationMovement;
};

const createVvmStatusLog = (database, itemBatch, status) => {
  const vvmStatus = database.create('VaccineVialMonitorStatusLog', {
    id: generateUUID(),
    itemBatch,
    status,
    timestamp: new Date(),
  });

  return vvmStatus;
};

const createSensorLog = (database, temperature, timestamp, sensor) => {
  const sensorLog = database.create('SensorLog', {
    id: generateUUID(),
    temperature,
    timestamp,
    sensor,
  });

  return sensorLog;
};

const createTemperatureLog = (database, temperature, timestamp, location) => {
  const temperatureLog = database.create('TemperatureLog', {
    id: generateUUID(),
    temperature,
    timestamp,
    location,
  });

  return temperatureLog;
};

const createTemperatureBreach = (
  database,
  startTimestamp,
  location,
  temperatureBreachConfiguration
) => {
  const temperatureLog = database.create('TemperatureBreach', {
    id: generateUUID(),
    startTimestamp,
    location,
    temperatureBreachConfiguration,
  });

  return temperatureLog;
};

/**
 * Create a Message record. This will be sent to the server and requests tables
 * when an app is upgraded from some version to another.
 *
 * @param {Realm}  database    App-wide database interface
 * @param {String} fromVersion Which version the app is being upgraded from.
 * @param {String} toVersion   Which version the app is being upgraded too.
 */

const createUpgradeMessage = (database, fromVersion, toVersion) => {
  const syncSiteId = database.getSetting(SETTINGS_KEYS.SYNC_SITE_ID);

  const body = {
    fromVersion: versionToInteger(fromVersion),
    toVersion: versionToInteger(toVersion),
    fromVersionString: String(fromVersion),
    toVersionString: String(toVersion),
    syncSiteId: Number(syncSiteId),
  };

  const message = database.create('Message', {
    id: generateUUID(),
    type: 'mobile_upgrade',
  });

  message.body = body;

  database.save('Message', message);

  return message;
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
    case 'IndicatorValue':
      return createIndicatorValue(database, ...args);
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
    case 'OffsetCustomerCredit':
      return createOffsetCustomerCredit(database, ...args);
    case 'SupplierCredit':
      return createSupplierCredit(database, ...args);
    case 'SupplierCreditLine':
      return createSupplierCreditLine(database, ...args);
    case 'InsurancePolicy':
      return createInsurancePolicy(database, ...args);
    case 'CashIn':
      return createCashIn(database, ...args);
    case 'CashOut':
      return createCashOut(database, ...args);
    case 'OffsetCustomerInvoice':
      return createOffsetCustomerInvoice(database, ...args);
    case 'RefundLine':
      return createCustomerRefundLine(database, ...args);
    case 'Address':
      return createAddress(database, ...args);
    case 'Patient':
      return createPatient(database, ...args);
    case 'Prescriber':
      return createPrescriber(database, ...args);
    case 'UpgradeMessage':
      return createUpgradeMessage(database, ...args);
    case 'Location':
      return createLocation(database, ...args);
    case 'Sensor':
      return createSensor(database, ...args);
    case 'LocationMovement':
      return createLocationMovement(database, ...args);
    case 'VaccineVialMonitorStatusLog':
      return createVvmStatusLog(database, ...args);
    case 'SensorLog':
      return createSensorLog(database, ...args);
    case 'TemperatureLog':
      return createTemperatureLog(database, ...args);
    case 'TemperatureBreach':
      return createTemperatureBreach(database, ...args);
    default:
      throw new Error(`Cannot create a record with unsupported type: ${type}`);
  }
};

export default createRecord;
