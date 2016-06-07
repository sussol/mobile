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
 * Parse the batch of incoming records, and integrate them into the local database
 * @param  {Realm}  database The local database
 * @param  {object} records  The json object the server sent to represent records
 * @return {none}
 */
export function integrateRecords(database, syncJson) {
  database.write(() => {
    let internalRecord;
    let item;
    let itemLine;
    let masterList;
    let name;
    let otherParty;
    let requisition;
    let requisitionLine;
    let stocktake;
    let stocktakeLine;
    let transaction;
    let transactionLine;
    syncJson.forEach((object) => {
      const record = object.data;
      const recordType = RECORD_TYPES.translate(object.RecordType, EXTERNAL_TO_INTERNAL);
      switch (recordType) {
        case 'Item':
          internalRecord = {
            id: record.ID,
            category: getObject(database, 'ItemCategory', record.category_ID),
            code: record.code,
            defaultPackSize: parseFloat(record.default_pack_size),
            defaultPrice: parseFloat(record.buy_price),
            department: getObject(database, 'ItemDepartment', record.department_ID),
            description: record.description,
            name: record.item_name,
          };
          database.update(recordType, internalRecord);
          break;
        case 'ItemCategory':
          internalRecord = {
            id: record.ID,
            name: record.Description,
          };
          database.update(recordType, internalRecord);
          break;
        case 'ItemDepartment':
          internalRecord = {
            id: record.ID,
            name: record.department,
          };
          database.update(recordType, internalRecord);
          break;
        case 'ItemLine':
          item = getObject(database, 'Item', record.item_ID);
          internalRecord = {
            id: record.ID,
            item: item,
            packSize: 1, // Every item line in mobile should be pack-to-one
            numberOfPacks: parseFloat(record.quantity) * parseFloat(record.pack_size),
            totalQuantity: parseFloat(record.quantity) * parseFloat(record.pack_size),
            expiryDate: getDate(record.expiry_date),
            batch: record.batch,
            costPrice: parseFloat(record.cost_price),
            sellPrice: parseFloat(record.sell_price),
            supplier: getObject(database, 'Name', record.name_ID),
          };
          itemLine = database.update(recordType, internalRecord);
          item.lines.push(itemLine);
          database.update(recordType, internalRecord);
          break;
        case 'MasterListNameJoin':
          name = getObject(database, 'Name', record.name_ID);
          masterList = getObject(database, 'MasterList', record.master_group_ID);
          name.masterList = masterList;
          break;
        case 'MasterList':
          internalRecord = {
            id: record.ID,
            name: record.description,
            note: record.note,
          };
          database.update(recordType, internalRecord);
          break;
        case 'MasterListLine':
          internalRecord = {
            id: record.ID,
            item: getObject(database, 'Item', record.item_ID),
            imprestQuantity: parseFloat(record.imprest_quan),
          };
          database.update(recordType, internalRecord);
          break;
        case 'Name':
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
          };
          database.update(recordType, internalRecord);
          break;
        case 'Requisition':
          internalRecord = {
            id: record.ID,
            status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
            entryDate: getDate(record.date_entered),
            daysToSupply: parseFloat(record.daysToSupply),
            serialNumber: parseFloat(record.serial_number),
            user: getObject(database, 'User', record.user_ID),
            type: REQUISITION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
          };
          database.update(recordType, internalRecord);
          break;
        case 'RequisitionLine':
          requisition = getObject(database, 'Requisition', record.requisition_ID);
          internalRecord = {
            id: record.ID,
            requisition: requisition,
            item: getObject(database, 'Item', record.item_ID),
            stockOnHand: parseFloat(record.stock_on_hand),
            suggestedQuantity: parseFloat(record.Cust_stock_order),
            imprestQuantity: parseFloat(record.imprest_or_prev_quantity),
            requiredQuantity: parseFloat(record.actualQuan),
            comment: record.comment,
            sortIndex: parseFloat(record.line_number),
          };
          requisitionLine = database.update(recordType, internalRecord);
          requisition.lines.push(requisitionLine);
          break;
        case 'Stocktake':
          internalRecord = {
            id: record.ID,
            name: record.Description,
            createdDate: getDate(record.stock_take_created_date),
            stocktakeDate: getDate(record.stock_take_date, record.stock_take_time),
            status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
            createdBy: getObject(database, 'User', record.created_by_ID),
            finalisedBy: getObject(database, 'User', record.finalised_by_ID),
            comment: record.comment,
            serialNumber: parseFloat(record.serialNumber),
            additions: getObject(database, 'Transaction', record.invad_additions_ID),
            reductions: getObject(database, 'Transaction', record.invad_reductions_ID),
          };
          database.update(recordType, internalRecord);
          break;
        case 'StocktakeLine':
          stocktake = getObject(database, 'Stocktake', record.stock_take_ID);
          internalRecord = {
            id: record.ID,
            stocktake: stocktake,
            itemLine: getObject(database, 'ItemLine', record.item_line_ID),
            snapshotQuantity: parseFloat(record.snapshot_qty) * parseFloat(record.snapshotPacksize),
            snapshotPacksize: 1, // Pack to one all mobile data
            expiry: getDate(record.expiry),
            batch: record.Batch,
            costPrice: parseFloat(record.costPrice),
            sellPrice: parseFloat(record.sellPrice),
            countedQuantity: parseFloat(record.stock_take_qty),
            sortIndex: parseFloat(record.line_number),
          };
          stocktakeLine = database.update(recordType, internalRecord);
          stocktake.lines.push(stocktakeLine);
          break;
        case 'Transaction':
          otherParty = getObject(database, 'Name', record.name_ID);
          internalRecord = {
            id: record.ID,
            serialNumber: parseFloat(record.invoice_num),
            otherParty: otherParty,
            comment: record.comment,
            entryDate: getDate(record.entry_date),
            type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
            status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
            confirmDate: getDate(record.confirm_date),
            enteredBy: getObject(database, 'User', record.user_ID),
            theirRef: record.their_ref,
            category: getObject(database, 'TransactionCategory', record.category_ID),
          };
          transaction = database.update(recordType, internalRecord);
          otherParty.transactions.push(transaction);
          break;
        case 'TransactionCategory':
          internalRecord = {
            id: record.ID,
            name: record.category,
            code: record.code,
            type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
          };
          database.update(recordType, internalRecord);
          break;
        case 'TransactionLine':
          transaction = getObject(database, 'Transaction', record.transaction_ID);
          internalRecord = {
            id: record.ID,
            itemId: record.item_ID,
            itemName: record.item_name,
            itemLine: getObject(database, 'ItemLine', record.item_line_ID),
            packSize: 1, // Pack to one all mobile data
            numberOfPacks: parseFloat(record.quantity) * parseFloat(record.pack_size),
            totalQuantity: parseFloat(record.quantity) * parseFloat(record.pack_size),
            transaction: transaction,
            note: record.note,
            costPrice: parseFloat(record.cost_price),
            sellPrice: parseFloat(record.sell_price),
            sortIndex: parseFloat(record.line_number),
            expiryDate: record.expiry_date,
            batch: record.batch,
          };
          transactionLine = database.update(recordType, internalRecord);
          transaction.lines.push(transactionLine);
          break;
        default:
          break; // Silently ignore record types we don't want to sync into mobile
      }
    });
  });
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
  if (!id) return null;
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
  const placeholderNumber = 1;
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
    case 'ItemLine':
      placeholder = {
        id: id,
        packSize: placeholderNumber,
        numberOfPacks: placeholderNumber,
        totalQuantity: placeholderNumber,
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
      };
      return placeholder;
    case 'Stocktake':
      placeholder = {
        id: id,
        name: placeholderString,
        createdDate: placeholderDate,
        status: placeholderString,
        serialNumber: placeholderNumber,
      };
      return placeholder;
    case 'Transaction':
      placeholder = {
        id: id,
        serialNumber: placeholderNumber,
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
  if (typeof line1 === 'string') results = results.filtered('line1 = $0', line1);
  if (typeof line2 === 'string') results = results.filtered('line2 = $0', line2);
  if (typeof line3 === 'string') results = results.filtered('line3 = $0', line3);
  if (typeof line4 === 'string') results = results.filtered('line4 = $0', line4);
  if (typeof zipCode === 'string') results = results.filtered('zipCode = $0', zipCode);
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
function getDate(ISODate, ISOTime) {
  const date = new Date(ISODate);
  if (ISOTime) {
    const hours = ISOTime.substring(0, 2);
    const minutes = ISOTime.substring(2, 4);
    const seconds = ISOTime.substring(4, 6);
    date.setHours(hours, minutes, seconds);
  }
  return date;
}

/**
 * Returns the next batch of incoming sync records
 * @param  {string}  serverURL  The URL of the sync server
 * @param  {string}  thisSiteId The sync ID of this sync site
 * @param  {string}  serverId   The sync ID of the server
 * @param  {integer} numRecords The number of records to fetch
 * @return {Promise}            Resolves with the records, or passes up any error thrown
 */
export async function getIncomingRecords(serverURL, thisSiteId, serverId, authHeader, numRecords) {
  const response = await fetch(
    `${serverURL}/sync/v2/queued_records`
    + `?from_site=${thisSiteId}&to_site=${serverId}&limit=${numRecords}`,
    {
      headers: {
        Authorization: authHeader,
      },
    });
  if (response.status < 200 || response.status >= 300) {
    throw new Error('Connection failure while pulling sync records.');
  }
  const responseJson = await response.json();
  if (responseJson.error && responseJson.error.length > 0) {
    throw new Error(responseJson.error);
  }
  return responseJson;
}

/**
 * Returns the number of records left to pull
 * @param  {string} serverURL  The URL of the sync server
 * @param  {string} thisSiteId The sync ID of this sync site
 * @param  {string} serverId   The sync ID of the server
 * @return {Promise}           Resolves with the record count, or passes up any error thrown
 */
export async function getWaitingRecordCount(serverURL, thisSiteId, serverId, authHeader) {
  return await fetch(
    `${serverURL}/sync/v2/queued_records/count?from_site=${thisSiteId}&to_site=${serverId}`,
    {
      headers: {
        Authorization: authHeader,
      },
    })
    .then((response) => response.json())
    .then((responseJson) => responseJson.NumRecords);
}

export async function acknowledgeRecords(serverURL, thisSiteId, serverId, authHeader, records) {
  const syncIds = records.map((record) => record.SyncID);
  const requestBody = {
    FromID: parseInt(serverId, 10), // one // three
    ToID: parseInt(thisSiteId, 10),
    acknowledged_records: { ItemFields: syncIds }, // two
  };
  await fetch(
    `${serverURL}/sync/v2/acknowledged_records?from_site=${thisSiteId}&to_site=${serverId}`,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader,
      },
      body: JSON.stringify(requestBody),
    });
}
