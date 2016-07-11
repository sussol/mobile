import {
  EXTERNAL_TO_INTERNAL,
  NAME_TYPES,
  RECORD_TYPES,
  REQUISITION_TYPES,
  STATUSES,
  TRANSACTION_TYPES,
} from './syncTranslators';

import { generateUUID } from '../database';

/**
 * Take the data from a sync record, and integrate it into the local database as
 * the given recordType. Will update an existing record if an id matches, or create
 * a new one if not.
 * @param  {Realm}  database   The local database
 * @param  {string} recordType External record type
 * @param  {object} record     Data from sync representing the record
 * @return {none}
 */
export function integrateIncomingRecord(database, recordType, record) {
  let internalRecord;
  const internalType = RECORD_TYPES.translate(recordType, EXTERNAL_TO_INTERNAL);
  switch (internalType) {
    case 'Item': {
      const packSize = parseNumber(record.default_pack_size);
      internalRecord = {
        id: record.ID,
        category: getObject(database, 'ItemCategory', record.category_ID),
        code: record.code,
        defaultPackSize: 1, // Every item batch in mobile should be pack-to-one
        defaultPrice: packSize ? parseNumber(record.buy_price) / packSize : 0,
        department: getObject(database, 'ItemDepartment', record.department_ID),
        description: record.description,
        name: record.item_name,
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'ItemCategory': {
      internalRecord = {
        id: record.ID,
        name: record.Description,
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'ItemDepartment': {
      internalRecord = {
        id: record.ID,
        name: record.department,
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'ItemBatch': {
      const item = getObject(database, 'Item', record.item_ID);
      const packSize = parseNumber(record.pack_size);
      internalRecord = {
        id: record.ID,
        item: item,
        packSize: 1, // Every item batch in mobile should be pack-to-one
        numberOfPacks: parseNumber(record.quantity) * packSize,
        expiryDate: parseDate(record.expiry_date),
        batch: record.batch,
        costPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        supplier: getObject(database, 'Name', record.name_ID),
      };
      const itemBatch = database.update(internalType, internalRecord);
      item.addBatch(itemBatch);
      database.save('Item', item);
      break;
    }
    case 'MasterListNameJoin': {
      const name = getObject(database, 'Name', record.name_ID);
      const masterList = getObject(database, 'MasterList', record.list_master_ID);
      name.masterList = masterList;
      database.save('Name', name);
      break;
    }
    case 'MasterList': {
      internalRecord = {
        id: record.ID,
        name: record.description,
        note: record.note,
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'MasterListItem': {
      const masterList = getObject(database, 'MasterList', record.item_master_ID);
      internalRecord = {
        id: record.ID,
        item: getObject(database, 'Item', record.item_ID),
        imprestQuantity: parseNumber(record.imprest_quan),
        masterList: masterList,
      };
      const masterListItem = database.update(internalType, internalRecord);
      masterList.addItem(masterListItem);
      break;
    }
    case 'Name': {
      internalRecord = {
        id: record.ID,
        name: record.name,
        code: record.code,
        phoneNumber: record.phone,
        billingAddress: getOrCreateAddress(database,
                                           record.bill_address1,
                                           record.bill_address2,
                                           record.bill_address3,
                                           record.bill_address4,
                                           record.bill_postal_zip_code),
        emailAddress: record.email,
        type: NAME_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        isCustomer: parseBoolean(record.customer),
        isSupplier: parseBoolean(record.supplier),
        isManufacturer: parseBoolean(record.manufacturer),
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'Requisition': {
      internalRecord = {
        id: record.ID,
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        entryDate: parseDate(record.date_entered),
        daysToSupply: parseNumber(record.daysToSupply),
        serialNumber: record.serial_number,
        user: getObject(database, 'User', record.user_ID),
        type: REQUISITION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'RequisitionItem': {
      const requisition = getObject(database, 'Requisition', record.requisition_ID);
      const dailyUsage = requisition.daysToSupply ?
                           parseNumber(record.Cust_stock_order) / requisition.daysToSupply : 0;
      internalRecord = {
        id: record.ID,
        requisition: requisition,
        item: getObject(database, 'Item', record.item_ID),
        stockOnHand: parseNumber(record.stock_on_hand),
        dailyUsage: dailyUsage,
        imprestQuantity: parseNumber(record.imprest_or_prev_quantity),
        requiredQuantity: parseNumber(record.actualQuan),
        comment: record.comment,
        sortIndex: parseNumber(record.line_number),
      };
      const requisitionItem = database.update(internalType, internalRecord);
      requisition.addItem(requisitionItem);
      database.save('Requisition', requisition);
      break;
    }
    case 'Stocktake': {
      internalRecord = {
        id: record.ID,
        name: record.Description,
        createdDate: parseDate(record.stock_take_created_date),
        stocktakeDate: parseDate(record.stock_take_date, record.stock_take_time),
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        createdBy: getObject(database, 'User', record.created_by_ID),
        finalisedBy: getObject(database, 'User', record.finalised_by_ID),
        comment: record.comment,
        serialNumber: record.serial_number,
        additions: getObject(database, 'Transaction', record.invad_additions_ID),
        reductions: getObject(database, 'Transaction', record.invad_reductions_ID),
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'StocktakeBatch': {
      const stocktake = getObject(database, 'Stocktake', record.stock_take_ID);
      const packSize = parseNumber(record.snapshot_packsize);
      const numPacks = parseNumber(record.snapshot_qty) * packSize;
      internalRecord = {
        id: record.ID,
        stocktake: stocktake,
        itemBatch: getObject(database, 'ItemBatch', record.item_line_ID),
        snapshotNumberOfPacks: numPacks,
        packSize: 1, // Pack to one all mobile data
        expiry: parseDate(record.expiry),
        batch: record.Batch,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        countedNumberOfPacks: numPacks,
        sortIndex: parseNumber(record.line_number),
      };
      const stocktakeBatch = database.update(internalType, internalRecord);
      stocktake.addBatch(database, stocktakeBatch);
      database.save('Stocktake', stocktake);
      break;
    }
    case 'Transaction': {
      const otherParty = getObject(database, 'Name', record.name_ID);
      internalRecord = {
        id: record.ID,
        serialNumber: record.invoice_num,
        comment: record.comment,
        entryDate: parseDate(record.entry_date),
        type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        confirmDate: parseDate(record.confirm_date),
        theirRef: record.their_ref,
      };
      const transaction = database.update(internalType, internalRecord);
      transaction.otherParty = otherParty;
      transaction.enteredBy = getObject(database, 'User', record.user_ID);
      transaction.category = getObject(database, 'TransactionCategory', record.category_ID);
      otherParty.addTransaction(transaction);
      database.save('Name', otherParty);
      break;
    }
    case 'TransactionCategory': {
      internalRecord = {
        id: record.ID,
        name: record.category,
        code: record.code,
        type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
      };
      database.update(internalType, internalRecord);
      break;
    }
    case 'TransactionBatch': {
      const transaction = getObject(database, 'Transaction', record.transaction_ID);
      const itemBatch = getObject(database, 'ItemBatch', record.item_line_ID);
      const item = getObject(database, 'Item', record.item_ID);
      itemBatch.item = item;
      item.addBatch(itemBatch);
      const packSize = parseNumber(record.pack_size);
      internalRecord = {
        id: record.ID,
        itemId: record.item_ID,
        itemName: record.item_name,
        itemBatch: itemBatch,
        packSize: 1, // Pack to one all mobile data
        numberOfPacks: parseNumber(record.quantity) * packSize,
        numberOfPacksSent: parseNumber(record.quantity) * packSize,
        transaction: transaction,
        note: record.note,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        sortIndex: parseNumber(record.line_number),
        expiryDate: parseDate(record.expiry_date),
        batch: record.batch,
      };
      const transactionBatch = database.update(internalType, internalRecord);
      transaction.addBatch(database, transactionBatch);
      database.save('Transaction', transaction);
      itemBatch.addTransactionBatch(transactionBatch);
      database.save('ItemBatch', itemBatch);
      break;
    }
    default:
      break; // Silently ignore record types we don't want to sync into mobile
  }
}

/**
 * Ensure the given record has the right data to create an internal record of the
 * given recordType
 * @param  {string} recordType The external record type this sync record should be used for
 * @param  {object} record     The data from the sync record
 * @return {boolean}           Whether the data is sufficient to create an internal record from
 */
export function sanityCheckIncomingRecord(recordType, record) {
  const internalType = RECORD_TYPES.translate(recordType, EXTERNAL_TO_INTERNAL);
  if (!record.ID || record.ID.length < 1) return false; // Every record needs an ID
  switch (internalType) {
    case 'Item':
      return record.code && record.item_name && record.default_pack_size;
    case 'ItemCategory':
      return typeof record.Description === 'string';
    case 'ItemDepartment':
      return typeof record.department === 'string';
    case 'ItemBatch':
      return record.item_ID && record.pack_size && record.quantity && record.batch
             && record.expiry_date && record.cost_price && record.sell_price;
    case 'MasterListNameJoin':
      return record.name_ID && record.list_master_ID;
    case 'MasterList':
      return typeof record.description === 'string';
    case 'MasterListItem':
      return record.item_ID;
    case 'Name':
      return record.name && record.code && record.type && record.customer
      && record.supplier && record.manufacturer;
    case 'Requisition':
      return record.status && record.date_entered && record.type && record.daysToSupply
             && record.serial_number;
    case 'RequisitionItem':
      return record.requisition_ID && record.item_ID && record.stock_on_hand
             && record.Cust_stock_order;
    case 'Stocktake':
      return record.Description && record.stock_take_created_date && record.status
             && record.serial_number;
    case 'StocktakeBatch':
      return record.stock_take_ID && record.item_line_ID && record.snapshot_qty
             && record.snapshot_packsize && record.expiry && record.Batch
             && record.cost_price && record.sell_price;
    case 'Transaction':
      return record.invoice_num && record.name_ID && record.entry_date && record.type
             && record.status;
    case 'TransactionCategory':
      return record.category && record.code && record.type;
    case 'TransactionBatch':
      return record.item_ID && record.item_name && record.item_line_ID && record.batch
             && record.expiry_date && record.pack_size && record.quantity && record.transaction_ID
             && record.cost_price && record.sell_price;
    default:
      return false; // Reject record types we don't want to sync into mobile
  }
}

/**
 * Returns the database object with the given id, if it exists, or creates a
 * placeholder with that id if it doesn't.
 * @param  {Realm}  database The local database
 * @param  {string} type     The type of database object
 * @param  {string} id       The id of the database object
 * @return {Realm.object}    Either the existing database object with the given
 *                           id, or a placeholder if none
 */
function getObject(database, type, id) {
  if (!id || id.length < 1) return null;
  const results = database.objects(type).filtered('id == $0', id);
  if (results.length > 0) return results[0];
  const placeholder = generatePlaceholder(type, id);
  return database.create(type, placeholder);
}

/**
 * Generate json representing the type of database object specified, with placeholder
 * values in all fields other than id.
 * @param  {string} type The type of database object
 * @param  {string} id   The id of the database object
 * @return {object}      Json object representing a placeholder of the given type
 */
function generatePlaceholder(type, id) {
  let placeholder;
  const placeholderString = 'placeholder';
  const placeholderNumber = 0;
  const placeholderDate = new Date();
  switch (type) {
    case 'Address':
      placeholder = {
        id: id,
      };
      return placeholder;
    case 'Item':
      placeholder = {
        id: id,
        code: placeholderString,
        name: placeholderString,
        defaultPackSize: placeholderNumber,
      };
      return placeholder;
    case 'ItemCategory':
      placeholder = {
        id: id,
        name: placeholderString,
      };
      return placeholder;
    case 'ItemDepartment':
      placeholder = {
        id: id,
        name: placeholderString,
      };
      return placeholder;
    case 'ItemBatch':
      placeholder = {
        id: id,
        packSize: placeholderNumber,
        numberOfPacks: placeholderNumber,
        expiryDate: placeholderDate,
        batch: placeholderString,
        costPrice: placeholderNumber,
        sellPrice: placeholderNumber,
      };
      return placeholder;
    case 'MasterList':
      placeholder = {
        id: id,
        name: placeholderString,
      };
      return placeholder;
    case 'Name':
      placeholder = {
        id: id,
        name: placeholderString,
        code: placeholderString,
        type: placeholderString,
        isCustomer: false,
        isSupplier: false,
        isManufacturer: false,
      };
      return placeholder;
    case 'Stocktake':
      placeholder = {
        id: id,
        name: placeholderString,
        createdDate: placeholderDate,
        status: placeholderString,
        serialNumber: placeholderString,
      };
      return placeholder;
    case 'Transaction':
      placeholder = {
        id: id,
        serialNumber: placeholderString,
        comment: placeholderString,
        entryDate: placeholderDate,
        type: placeholderString,
        status: placeholderString,
        theirRef: placeholderString,
      };
      return placeholder;
    case 'TransactionCategory':
      placeholder = {
        id: id,
        name: placeholderString,
        code: placeholderString,
        type: placeholderString,
      };
      return placeholder;
    case 'User':
      placeholder = {
        id: id,
        username: placeholderString,
        passwordHash: placeholderString,
      };
      return placeholder;
    default:
      throw new Error('Unsupported database object type.');
  }
}

/**
 * Return a database Address object with the given address details (reuse if one
 * already exists).
 * @param  {Realm}  database The local database
 * @param  {string} line1    Line 1 of the address (can be undefined)
 * @param  {string} line2    Line 2 of the address (can be undefined)
 * @param  {string} line3    Line 3 of the address (can be undefined)
 * @param  {string} line4    Line 4 of the address (can be undefined)
 * @param  {string} zipCode  Zip code of the address (can be undefined)
   * @return {Realm.object}  The Address object described by the params
 */
function getOrCreateAddress(database, line1, line2, line3, line4, zipCode) {
  let results = database.objects('Address');
  if (typeof line1 === 'string') results = results.filtered('line1 == $0', line1);
  if (typeof line2 === 'string') results = results.filtered('line2 == $0', line2);
  if (typeof line3 === 'string') results = results.filtered('line3 == $0', line3);
  if (typeof line4 === 'string') results = results.filtered('line4 == $0', line4);
  if (typeof zipCode === 'string') results = results.filtered('zipCode == $0', zipCode);
  if (results.length > 0) return results[0];
  const address = { id: generateUUID() };
  if (typeof line1 === 'string') address.line1 = line1;
  if (typeof line2 === 'string') address.line2 = line2;
  if (typeof line3 === 'string') address.line3 = line3;
  if (typeof line4 === 'string') address.line4 = line4;
  if (typeof zipCode === 'string') address.zipCode = zipCode;
  return database.create('Address', address);
}

/**
 * Return a javascript Date object representing the given date (and optionally, time.)
 * @param  {string} ISODate The date in ISO 8601 format
 * @param  {string} ISOTime The time in ISO 8601 format
 * @return {Date}           The Date object described by the params
 */
function parseDate(ISODate, ISOTime) {
  if (!ISODate || ISODate.length < 1 || ISODate === '0000-00-00T00:00:00') return null;
  const date = new Date(ISODate);
  if (ISOTime && ISOTime.length >= 6) {
    const hours = ISOTime.substring(0, 2);
    const minutes = ISOTime.substring(2, 4);
    const seconds = ISOTime.substring(4, 6);
    date.setHours(hours, minutes, seconds);
  }
  return date;
}

/**
 * Returns the number string as a float, or null if none passed
 * @param  {string} numberString The string to convert to a number
 * @return {float}               The numeric representation of the string
 */
function parseNumber(numberString) {
  if (!numberString || numberString.length < 1) return null;
  try {
    return parseFloat(numberString);
  } catch (error) {
    throw error;
  }
}

/**
 * Returns the boolean string as a boolean (false if none passed)
 * @param  {string} numberString The string to convert to a boolean
 * @return {boolean}               The boolean representation of the string
 */
function parseBoolean(booleanString) {
  const trueStrings = ['true', 'True', 'TRUE'];
  return booleanString && trueStrings.indexOf(booleanString) >= 0;
}
