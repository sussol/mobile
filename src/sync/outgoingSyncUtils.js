import {
  getPriceExtension,
  getTransactionTotalPrice,
} from '../utilities';

import {
  INTERNAL_TO_EXTERNAL,
  RECORD_TYPES,
  REQUISITION_TYPES,
  STATUSES,
  SYNC_TYPES,
  TRANSACTION_LINE_TYPES,
  TRANSACTION_TYPES,
} from './syncTranslators';

import { SETTINGS_KEYS } from '../settings';
const {
  SUPPLYING_STORE_ID,
  THIS_STORE_ID,
  THIS_STORE_NAME_ID,
} = SETTINGS_KEYS;

/**
 * Returns a json object fulfilling the requirements of the mSupply primary sync
 * server, based on a given syncOutRecord
 * @param  {Realm}        database      The local database
 * @param  {Settings}     settings      Access to local settings
 * @param  {Realm.object} syncOutRecord The sync out record to be translated
 * @return {object}                     The generated json object, ready to sync
 */
export function generateSyncJson(database, settings, syncOutRecord) {
  if (!syncOutRecord.recordType || !syncOutRecord.id) throw new Error('Malformed sync out record');
  const recordType = syncOutRecord.recordType;

  let syncData;
  if (syncOutRecord.changeType === 'delete') {
    // If record has been deleted, just sync up the ID
    syncData = { ID: syncOutRecord.recordId };
  } else {
    // Get the record the syncOutRecord refers to from the database
    const recordResults = database.objects(recordType, `id == ${syncOutRecord.id}`);
    if (!recordResults || recordResults.length === 0) { // No such record
      throw new Error(`${syncOutRecord.type} with id = ${syncOutRecord.id} missing`);
    } else if (recordResults.length > 1) { // Duplicate records
      throw new Error(`Multiple ${syncOutRecord.type} records with id = ${syncOutRecord.id}`);
    }
    const record = recordResults[0];

    // Generate the appropriate data for the sync object to carry, representing the
    // record in its upstream form
    syncData = generateSyncData(settings, recordType, record);
  }

  // Create the JSON object to sync
  const syncJson = {
    SyncID: syncOutRecord.id,
    RecordType: RECORD_TYPES.translate(recordType, INTERNAL_TO_EXTERNAL),
    SyncType: SYNC_TYPES.translate(syncOutRecord.changeType, INTERNAL_TO_EXTERNAL),
    StoreID: settings.get(THIS_STORE_ID),
    Data: syncData,
  };
  return syncJson;
}

/**
 * Turn an internal database object into data representing a record in the
 * mSupply primary server, ready for sync
 * @param  {Settings}     settings   Access to local settings
 * @param  {string}       recordType Internal type of record being synced
 * @param  {Realm.object} record     The record being synced
 * @return {object}                  The data to sync (in the form of upstream record)
 */
function generateSyncData(settings, recordType, record) {
  let getNumPacks;
  let totalPrice;
  let transaction;
  let itemLine;
  switch (recordType) {
    case 'ItemLine':
      return {
        ID: record.id,
        store_ID: settings.get(THIS_STORE_ID),
        item_ID: record.item.id,
        pack_size: record.packSize,
        expiry_date: record.expiryDate.toISOString(),
        batch: record.batch,
        available: record.numberOfPacks,
        quantity: record.numberOfPacks,
        stock_on_hand_tot: record.totalQuantity,
        cost_price: record.costPrice,
        sell_price: record.sellPrice,
        total_cost: record.costPrice * record.numberOfPacks,
        name_ID: record.supplier.id,
      };
    case 'Requisition':
      return {
        ID: record.id,
        date_entered: record.entryDate.toISOString(),
        user_ID: record.user.id,
        name_ID: settings.get(THIS_STORE_NAME_ID),
        status: STATUSES.translate(record.status, INTERNAL_TO_EXTERNAL),
        daysToSupply: record.daysToSupply,
        store_ID: settings.get(SUPPLYING_STORE_ID),
        serial_number: record.serialNumber,
        type: REQUISITION_TYPES.translate(record.type, INTERNAL_TO_EXTERNAL),
      };
    case 'RequisitionLine':
      return {
        ID: record.id,
        requisition_ID: record.requisition.id,
        item_ID: record.item.id,
        stock_on_hand: record.stockOnHand,
        actualQuan: record.requiredQuantity,
        imprest_or_prev_quantity: record.imprestQuantity,
        line_number: record.sortIndex,
        Cust_stock_order: record.suggestedQuantity,
        comment: record.comment,
      };
    case 'Stocktake':
      return {
        ID: record.id,
        stock_take_date: record.stocktakeDate.toISOString(),
        stock_take_time: record.stocktakeDate.toTimeString().substring(0, 8),
        created_by_ID: record.createdBy.id,
        status: STATUSES.translate(record.status, INTERNAL_TO_EXTERNAL),
        finalised_by_ID: record.finalisedBy.id,
        invad_additions_ID: record.additions.id,
        invad_reductions_ID: record.subtractions.id,
        store_ID: settings.get(THIS_STORE_ID),
        comment: record.comment,
        stock_take_created_date: record.createdDate.toISOString(),
        serial_number: record.serialNumber,
      };
    case 'StocktakeLine':
      itemLine = record.itemLine;
      getNumPacks = (numPieces, packSize) => (packSize === 0 ? 0 : numPieces / packSize);
      return {
        ID: record.id,
        stock_take_ID: record.Stocktake.id,
        item_line_ID: itemLine.id,
        snapshot_qty: getNumPacks(record.snapshotQuantity, record.snapshotPacksize),
        snapshot_packsize: record.snapshotPacksize,
        stock_take_qty: getNumPacks(record.countedQuantity, record.snapshotPacksize),
        line_number: record.sortIndex,
        expiry: itemLine.expiryDate.toISOString(),
        cost_price: itemLine.costPrice,
        sell_price: itemLine.sellPrice,
        Batch: itemLine.batch,
        item_ID: itemLine.item.id,
      };
    case 'Transaction':
      totalPrice = getTransactionTotalPrice(record);
      return {
        ID: record.id,
        name_ID: record.otherParty && record.otherParty.id,
        invoice_num: record.serialNumber,
        comment: record.comment,
        entry_date: record.entryDate,
        type: TRANSACTION_TYPES.translate(record.type, INTERNAL_TO_EXTERNAL),
        status: STATUSES.translate(record.status, INTERNAL_TO_EXTERNAL),
        total: totalPrice,
        their_ref: record.theirRef,
        confirm_date: record.confirmDate && record.confirmDate.toISOString(),
        subtotal: totalPrice,
        user_ID: record.enteredBy && record.enteredBy.id,
        category_ID: record.category && record.category.id,
        confirm_time: record.confirmDate && record.confirmDate.toTimeString().substring(0, 8),
        store_ID: settings.get(THIS_STORE_ID),
      };
    case 'TransactionLine':
      itemLine = record.itemLine;
      transaction = record.transaction;
      return {
        ID: record.id,
        transaction_ID: record.transaction.id,
        item_ID: record.itemId,
        batch: itemLine.batch,
        price_extension: getPriceExtension(record),
        note: record.note,
        cost_price: record.costPrice,
        sell_price: record.sellPrice,
        expiry_date: itemLine.expiryDate,
        pack_size: record.packSize,
        quantity: record.numberOfPacks,
        item_line_ID: itemLine.id,
        line_number: record.sortIndex,
        item_name: record.itemName,
        is_from_inventory_adjustment: transaction.otherParty.type === 'inventory_adjustment',
        type: TRANSACTION_LINE_TYPES.translate(record, INTERNAL_TO_EXTERNAL),
      };
    default:
      throw new Error('Sync out record type not supported.');
  }
}
