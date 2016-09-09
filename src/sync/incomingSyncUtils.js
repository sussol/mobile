import {
  EXTERNAL_TO_INTERNAL,
  NAME_TYPES,
  RECORD_TYPES,
  REQUISITION_STATUSES,
  REQUISITION_TYPES,
  SEQUENCE_KEYS,
  STATUSES,
  SYNC_TYPES,
  TRANSACTION_TYPES,
} from './syncTranslators';

import { SETTINGS_KEYS } from '../settings';
const { THIS_STORE_ID } = SETTINGS_KEYS;

import { CHANGE_TYPES, generateUUID } from '../database';

/**
 * Take the data from a sync record, and integrate it into the local database as
 * the given recordType. If create or update, will update an existing record if
 * an id matches, or create a new one if not. If delete, will just clean up/delete.
 * @param  {Realm}  database   The local database
 * @param  {object} settings   Access to app settings
 * @param  {string} syncType   The type of change that created this sync record
 * @param  {object} syncRecord Data representing the sync record
 * @return {none}
 */
export function integrateRecord(database, settings, syncRecord) {
  // If the sync record is missing either data, record type, sync type, or record ID, ignore
  if (!syncRecord.RecordType || !syncRecord.SyncType) return;
  const syncType = syncRecord.SyncType;
  const recordType = syncRecord.RecordType;
  const changeType = SYNC_TYPES.translate(syncType, EXTERNAL_TO_INTERNAL);
  const internalRecordType = RECORD_TYPES.translate(recordType, EXTERNAL_TO_INTERNAL);

  switch (changeType) {
    case CHANGE_TYPES.CREATE:
    case CHANGE_TYPES.UPDATE:
      if (!syncRecord.data) return; // If missing data representing record, ignore
      createOrUpdateRecord(database, settings, internalRecordType, syncRecord.data);
      break;
    case CHANGE_TYPES.DELETE:
      if (!syncRecord.RecordID) return; // If missing record id, ignore
      deleteRecord(database, internalRecordType, syncRecord.RecordID);
      break;
    default:
      return; // Silently ignore change types we don't handle, e.g. merges
  }
}

/**
 * Update an existing record or create a new one based on the sync record.
 * @param  {Realm}  database   The local database
 * @param  {object} settings   Access to app settings
 * @param  {string} recordType Internal record type
 * @param  {object} record     Data from sync representing the record
 * @return {none}
 */
export function createOrUpdateRecord(database, settings, recordType, record) {
  if (!sanityCheckIncomingRecord(recordType, record)) return; // Unsupported or malformed record
  let internalRecord;
  switch (recordType) {
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
      database.update(recordType, internalRecord);
      break;
    }
    case 'ItemCategory': {
      internalRecord = {
        id: record.ID,
        name: record.Description,
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'ItemDepartment': {
      internalRecord = {
        id: record.ID,
        name: record.department,
      };
      database.update(recordType, internalRecord);
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
      const itemBatch = database.update(recordType, internalRecord);
      item.addBatchIfUnique(itemBatch);
      database.save('Item', item);
      break;
    }
    case 'ItemStoreJoin': {
      const joinsThisStore = record.store_ID === settings.get(THIS_STORE_ID);
      internalRecord = {
        id: record.ID,
        itemId: record.item_ID,
        joinsThisStore: joinsThisStore,
      };
      database.update(recordType, internalRecord);
      if (joinsThisStore) { // If it joins this store, set the name's visibility
        const item = getObject(database, 'Item', record.item_ID);
        item.isVisible = !parseBoolean(record.inactive);
        database.save('Item', item);
      }
      break;
    }
    // LocalListItem not a class defined in our realm. The structure from mSupply
    // will be replaced by storing equivalent infomation in a MasterList. LocalListItem
    // objects will be mapped to MasterListItems in sync.
    case 'LocalListItem': {
      const item = getObject(database, 'Item', record.item_ID);
      // Grabbing the masterList using list_master_name_join_ID as the join's id is used in mobile
      // to mimic the local list join with a MasterList.
      const masterList = getObject(database, 'MasterList',
                                          record.list_master_name_join_ID);

      internalRecord = {
        id: record.ID,
        item: item,
        imprestQuantity: parseNumber(record.imprest_quantity),
        masterList: masterList,
      };
      const localListItem = database.update('MasterListItem', internalRecord);
      masterList.addItemIfUnique(localListItem);
      break;
    }
    case 'MasterListNameJoin': {
      const name = getObject(database, 'Name', record.name_ID);
      let masterList;
      if (!record.list_master_ID) {
        // mSupply list_local_line don't have a list_master_ID, map the join to a MasterList
        masterList = getObject(database, 'MasterList', record.ID);
        masterList.name = record.description;
        database.save('MasterList', masterList);
      } else {
        // Regular MasterListNameJoin
        masterList = getObject(database, 'MasterList', record.list_master_ID);
        internalRecord = {
          id: record.ID,
          name: name,
          masterList: masterList,
        };
        database.update(recordType, internalRecord);
      }

      name.addMasterListIfUnique(masterList);
      database.save('Name', name);
      break;
    }
    case 'MasterList': {
      internalRecord = {
        id: record.ID,
        name: record.description,
        note: record.note,
      };
      database.update(recordType, internalRecord);
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
      const masterListItem = database.update(recordType, internalRecord);
      masterList.addItemIfUnique(masterListItem);
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
        supplyingStoreId: record.supplying_store_id,
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'NameStoreJoin': {
      const joinsThisStore = record.store_ID === settings.get(THIS_STORE_ID);
      internalRecord = {
        id: record.ID,
        nameId: record.name_ID,
        joinsThisStore: joinsThisStore,
      };
      database.update(recordType, internalRecord);
      if (joinsThisStore) { // If it joins this store, set the name's visibility
        const name = getObject(database, 'Name', record.name_ID);
        name.isVisible = !parseBoolean(record.inactive);
        database.save('Name', name);
      }
      break;
    }
    case 'NumberSequence': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(record.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      // Don't accept updates to number sequences
      if (database.objects('NumberSequence')
                  .filtered('sequenceKey == $0', sequenceKey).length > 0) break;
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store
      internalRecord = {
        id: record.ID,
        sequenceKey: sequenceKey,
        highestNumberUsed: parseNumber(record.value),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'NumberToReuse': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(record.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store
      const numberSequence = getObject(database, 'NumberSequence', sequenceKey, 'sequenceKey');
      internalRecord = {
        id: record.ID,
        numberSequence: numberSequence,
        number: parseNumber(record.number_to_use),
      };
      const numberToReuse = database.update(recordType, internalRecord);
      // Attach the number to reuse to the number seqeunce
      numberSequence.addNumberToReuse(numberToReuse);
      break;
    }
    case 'Requisition': {
      let status = REQUISITION_STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL);
      // If not a special wp or wf status, use the normal status translation
      if (!status) status = STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL);
      internalRecord = {
        id: record.ID,
        status: REQUISITION_STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        entryDate: parseDate(record.date_entered),
        daysToSupply: parseNumber(record.daysToSupply),
        serialNumber: record.serial_number,
        requesterReference: record.requester_reference,
        comment: record.comment,
        enteredBy: getObject(database, 'User', record.user_ID),
        type: REQUISITION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
      };
      database.update(recordType, internalRecord);
      break;
    }
    case 'RequisitionItem': {
      const requisition = getObject(database, 'Requisition', record.requisition_ID);
      internalRecord = {
        id: record.ID,
        requisition: requisition,
        item: getObject(database, 'Item', record.item_ID),
        stockOnHand: parseNumber(record.stock_on_hand),
        dailyUsage: parseNumber(record.daily_usage),
        requiredQuantity: parseNumber(record.Cust_stock_order),
        comment: record.comment,
        sortIndex: parseNumber(record.line_number),
      };
      const requisitionItem = database.update(recordType, internalRecord);
      requisition.addItemIfUnique(requisitionItem);
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
      database.update(recordType, internalRecord);
      break;
    }
    case 'StocktakeBatch': {
      const stocktake = getObject(database, 'Stocktake', record.stock_take_ID);
      const packSize = parseNumber(record.snapshot_packsize);
      internalRecord = {
        id: record.ID,
        stocktake: stocktake,
        itemBatch: getObject(database, 'ItemBatch', record.item_line_ID),
        snapshotNumberOfPacks: parseNumber(record.snapshot_qty) * packSize,
        packSize: 1, // Pack to one all mobile data
        expiry: parseDate(record.expiry),
        batch: record.Batch,
        costPrice: packSize ? parseNumber(record.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(record.sell_price) / packSize : 0,
        countedNumberOfPacks: parseNumber(record.stock_take_qty) * packSize,
        sortIndex: parseNumber(record.line_number),
      };
      const stocktakeBatch = database.update(recordType, internalRecord);
      stocktake.addBatchIfUnique(database, stocktakeBatch);
      database.save('Stocktake', stocktake);
      break;
    }
    case 'Transaction': {
      if (record.store_ID !== settings.get(THIS_STORE_ID)) break; // Not for this store
      const otherParty = getObject(database, 'Name', record.name_ID);
      const enteredBy = getObject(database, 'User', record.user_ID);
      internalRecord = {
        id: record.ID,
        serialNumber: record.invoice_num,
        comment: record.comment,
        entryDate: parseDate(record.entry_date),
        enteredBy: enteredBy,
        type: TRANSACTION_TYPES.translate(record.type, EXTERNAL_TO_INTERNAL),
        status: STATUSES.translate(record.status, EXTERNAL_TO_INTERNAL),
        confirmDate: parseDate(record.confirm_date),
        theirRef: record.their_ref,
      };
      const transaction = database.update(recordType, internalRecord);
      transaction.otherParty = otherParty;
      transaction.enteredBy = getObject(database, 'User', record.user_ID);
      transaction.category = getObject(database, 'TransactionCategory', record.category_ID);
      otherParty.addTransactionIfUnique(transaction);
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
      database.update(recordType, internalRecord);
      break;
    }
    case 'TransactionBatch': {
      const transaction = getObject(database, 'Transaction', record.transaction_ID);
      const itemBatch = getObject(database, 'ItemBatch', record.item_line_ID);
      const item = getObject(database, 'Item', record.item_ID);
      itemBatch.item = item;
      item.addBatchIfUnique(itemBatch);
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
      const transactionBatch = database.update(recordType, internalRecord);
      transaction.addBatchIfUnique(database, transactionBatch);
      database.save('Transaction', transaction);
      itemBatch.addTransactionBatchIfUnique(transactionBatch);
      database.save('ItemBatch', itemBatch);
      break;
    }
    default:
      break; // Silently ignore record types we don't want to sync into mobile
  }
}

/**
 * Delete the record with the given id, relying on its destructor to initiate any
 * changes that are required to clean up that type of record.
 * @param  {Realm}  database   App wide local database
 * @param  {string} recordType Internal record type
 * @param  {string} primaryKey       The primary key of the database object, usually its id
 * @param  {string} primaryKeyField  The field used as the primary key, defaults to 'id'
 * @return {none}
 */
function deleteRecord(database, recordType, primaryKey, primaryKeyField = 'id') {
  // 'delete' is a reserved word, deleteRecord is in the upper scope, so here we have:
  const obliterate = () => {
    const deleteResults = database.objects(recordType)
                                  .filtered(`${primaryKeyField} == $0`, primaryKey);
    if (deleteResults && deleteResults.length > 0) database.delete(recordType, deleteResults[0]);
  };

  switch (recordType) {
    case 'Item':
    case 'ItemBatch':
    case 'ItemCategory':
    case 'ItemDepartment':
    case 'ItemStoreJoin':
    case 'MasterList':
    case 'MasterListItem':
    case 'Name':
    case 'NameStoreJoin':
    case 'NumberSequence':
    case 'NumberToReuse':
    case 'Requisition':
    case 'RequisitionItem':
    case 'Stocktake':
    case 'StocktakeBatch':
    case 'Transaction':
    case 'TransactionBatch':
    case 'TransactionCategory': {
      obliterate();
      break;
    }
    // LocalListItem is mimicked with MasterListItem
    case 'LocalListItem':
      deleteRecord(database, 'MasterListItem', primaryKey, primaryKeyField);
      break;
    case 'MasterListNameJoin': {
      // Joins for local lists are mapped to and mimicked by a MasterList of the same id.
      const masterList = database.objects('MasterList').filtered('id == $0', primaryKey)[0];
      if (masterList) {
        // Is a local list, so delete the MasterList that was created for it.
        deleteRecord(database, 'MasterList', primaryKey, primaryKeyField);
      } else {
        // Delete the MasterListNameJoin as in the normal/expected case.
        obliterate();
      }
      break;
    }
    default:
      break; // Silently ignore record types we don't want to sync into mobile
  }
}

/**
 * Ensure the given record has the right data to create an internal record of the
 * given recordType
 * @param  {string} recordType The internal record type this sync record should be used for
 * @param  {object} record     The data from the sync record
 * @return {boolean}           Whether the data is sufficient to create an internal record from
 */
export function sanityCheckIncomingRecord(recordType, record) {
  if (!record.ID || record.ID.length < 1) return false; // Every record needs an ID
  const requiredFields = {
    Item: ['code', 'item_name', 'default_pack_size'],
    ItemCategory: ['Description'],
    ItemDepartment: ['department'],
    ItemBatch: ['item_ID', 'pack_size', 'quantity', 'batch', 'expiry_date',
                'cost_price', 'sell_price'],
    ItemStoreJoin: ['item_ID', 'store_ID'],
    LocalListItem: ['item_ID', 'list_master_name_join_ID'],
    MasterListNameJoin: ['description', 'name_ID', 'list_master_ID'],
    MasterList: ['description'],
    MasterListItem: ['item_ID'],
    Name: ['name', 'code', 'type', 'customer', 'supplier', 'manufacturer'],
    NameStoreJoin: ['name_ID', 'store_ID'],
    NumberSequence: ['name', 'value'],
    NumberReuse: ['name', 'number_to_use'],
    Requisition: ['status', 'date_entered', 'type', 'daysToSupply', 'serial_number',
                  'requester_reference'],
    RequisitionItem: ['requisition_ID', 'item_ID', 'stock_on_hand', 'Cust_stock_order'],
    Stocktake: ['Description', 'stock_take_created_date', 'status', 'serial_number'],
    StocktakeBatch: ['stock_take_ID', 'item_line_ID', 'snapshot_qty', 'snapshot_packsize',
                     'expiry', 'Batch', 'cost_price', 'sell_price'],
    Transaction: ['invoice_num', 'name_ID', 'entry_date', 'type', 'status', 'store_ID'],
    TransactionCategory: ['category', 'code', 'type'],
    TransactionBatch: ['item_ID', 'item_name', 'item_line_ID', 'batch', 'expiry_date',
                       'pack_size', 'quantity', 'transaction_ID', 'cost_price', 'sell_price'],
  };
  if (!requiredFields[recordType]) return false; // Unsupported record type
  return requiredFields[recordType].reduce((containsAllFieldsSoFar, fieldName) =>
                                              containsAllFieldsSoFar && record[fieldName] !== null,
                                            true);
}

/**
 * Returns the database object with the given id, if it exists, or creates a
 * placeholder with that id if it doesn't.
 * @param  {Realm}  database         The local database
 * @param  {string} type             The type of database object
 * @param  {string} primaryKey       The primary key of the database object, usually its id
 * @param  {string} primaryKeyField  The field used as the primary key, defaults to 'id'
 * @return {Realm.object}            Either the existing database object with the given
 *                                   primary key, or a placeholder if none
 */
function getObject(database, type, primaryKey, primaryKeyField = 'id') {
  if (!primaryKey || primaryKey.length < 1) return null;
  const results = database.objects(type).filtered(`${primaryKeyField} == $0`, primaryKey);
  if (results.length > 0) return results[0];
  const defaultObject = {};
  defaultObject[primaryKeyField] = primaryKey;
  return database.create(type, defaultObject);
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
    const minutes = ISOTime.substring(3, 5);
    const seconds = ISOTime.substring(6, 8);
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
  return parseFloat(numberString);
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
