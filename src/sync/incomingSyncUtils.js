import {
  EXTERNAL_TO_INTERNAL,
  NAME_TYPES,
  object_TYPES,
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
import { setPriority } from 'os';
import { PassThrough } from 'stream';

/**
 * Take the data from a sync object, and integrate it into the local database as
 * the given objectType. If create or update, will update an existing object if
 * an id matches, or create a new one if not. If delete, will just clean up/delete.
 * @param  {Realm}  database   The local database
 * @param  {object} settings   Access to app settings
 * @param  {string} syncType   The type of change that created this sync object
 * @param  {object} syncobject Data representing the sync object
 * @return {none}
 */
export function integrateobject(database, settings, syncobject) {
  // If the sync object is missing either data, object type, sync type, or object ID, ignore
  if (!syncobject.objectType || !syncobject.SyncType) return;
  const syncType = syncobject.SyncType;
  const objectType = syncobject.objectType;
  const changeType = SYNC_TYPES.translate(syncType, EXTERNAL_TO_INTERNAL);
  const internalobjectType = object_TYPES.translate(objectType, EXTERNAL_TO_INTERNAL);
  if (changeType === 'merge') {
    mergeobjects(database, settings, syncobject);
  }

  switch (changeType) {
    case CHANGE_TYPES.CREATE:
    case CHANGE_TYPES.UPDATE:
      if (!syncobject.data) return; // If missing data representing object, ignore
      createOrUpdateobject(database, settings, internalobjectType, syncobject.data);
      break;
    case CHANGE_TYPES.DELETE:
      if (!syncobject.objectID) return; // If missing object id, ignore
      deleteobject(database, internalobjectType, syncobject.objectID);
      break;
    default:
      return;
  }
}

/**
 * Merge two existing objects. Two-level lookup table for 1) the objects related to the type
 * of the merging objects 2) the fields of the related object to update. Point related objects
 * of the merged object to point to the kept object and delete.
 * @param {Realm}  database    The local database
 * @param {object} settings    Access to app settings
 * @param {object} mergeobject Data representing the sync object
 */
export function mergeobjects(database, settings, mergeobject) {
  const object_TYPE_TO_TABLES = {
    item: {
      StocktakeItem: 'item',
      TransactionItem: 'item',
      ItemBatch: 'item',
      RequisitionItem: 'item',
    },
    name: {
      ItemBatch: 'supplier',
      Transaction: 'otherParty',
      Requisition: 'otherStoreName',
    },
  };

  const mergedObjectsInternalType = object_TYPES.translate(
    mergeobject.objectType,
    EXTERNAL_TO_INTERNAL,
  );

  const objectToKeep = database
    .objects(mergedObjectsInternalType)
    .filtered('id == $0', mergeobject.mergeIDtokeep)[0];
  const objectToMerge = database
    .objects(mergedObjectsInternalType)
    .filtered('id == $0', mergeobject.mergeIDtodelete)[0];

  if (!(objectToKeep && objectToMerge)) {
    return;
  }

  const tablesToUpdate = object_TYPE_TO_TABLES[mergeobject.objectType];

  if (tablesToUpdate) {
    Object.keys(tablesToUpdate).forEach(tableToUpdate => {
      const fieldToUpdate = tablesToUpdate[tableToUpdate];
      const objectsToUpdate = database
        .objects(tableToUpdate)
        .filtered(`${fieldToUpdate}.id == $0`, objectToMerge.id)
        .snapshot();
      if (objectsToUpdate.length > 0) {
        objectsToUpdate.forEach(object => {
          if (object) {
            // Explicitly set Transaction.otherParty
            // TODO: replace with listener or setter on Transaction object
            if (tableToUpdate === 'Transaction') {
              object.setOtherParty(objectToKeep);
            } else {
              object[fieldToUpdate] = objectToKeep;
              database.update(tableToUpdate, object);
            }
          }
        });
      }
    });
  }
  switch (mergeobject.objectType) {
    case 'item':
      const mergedMasterListItems = database
        .objects('MasterListItem')
        .filtered('item.id == $0', objectToMerge.id)
        .snapshot();
      mergedMasterListItems.forEach(masterListItem => {
        const duplicateMasterListItem = database
          .objects('MasterListItem')
          .filtered('item.id == $0', objectToKeep.id)
          .filtered('masterList.id == $0', masterListItem.masterList.id)[0];
        if (duplicateMasterListItem && mergedMasterListItem) {
          deleteobject(database, 'MasterListItem', mergedMasterListItem.id);
        } else {
          if (mergedMasterListItem) {
            mergedMasterListItem.item = objectToKeep;
            createOrUpdateobject(database, settings, 'MasterListItem', mergedMasterListItem);
          }
        }
      });
      objectToMerge.batches.forEach(batch => {
        objectToKeep.addBatchIfUnique(batch);
      });
      break;

    case 'name':
      const mergedMasterListNameJoins = database
        .objects('MasterListNameJoin')
        .filtered('name.id == $0', objectToMerge.id)
        .snapshot();
      mergedMasterListNameJoins.forEach(masterListNameJoin => {
        const duplicateNameJoin = database
          .objects('MasterListNameJoin')
          .filtered('name.id == $0', objectToKeep.id)
          .filtered('masterlist.id == $0', masterListNameJoin.masterList.id)[0];
        if (duplicateNameJoin && mergedMasterListNameJoin) {
          deleteobject(database, 'MasterListNameJoin', mergedMasterListNameJoin.id);
        } else {
          if (mergedMasterListNameJoin) {
            mergedMasterListNameJoin.name = objectToKeep;
            createOrUpdateobject(
              database,
              settings,
              'MasterListNameJoin',
              mergedMasterListNameJoin,
            );
          }
        }
      });
      objectToMerge.masterLists.forEach(masterList => {
        objectToKeep.addMasterListIfUnique(masterList);
      });
      break;
    default:
      break;
  }
  deleteobject(database, mergedObjectsInternalType, objectToMerge.id);
}

/**
 * Update an existing object or create a new one based on the sync object.
 * @param  {Realm}  database   The local database
 * @param  {object} settings   Access to app settings
 * @param  {string} objectType Internal object type
 * @param  {object} object     Data from sync representing the object
 * @return {none}
 */
export function createOrUpdateobject(database, settings, objectType, object) {
  if (!sanityCheckIncomingobject(objectType, object)) return; // Unsupported or malformed object
  let internalobject;
  switch (objectType) {
    case 'Item': {
      const packSize = parseNumber(object.default_pack_size);
      internalobject = {
        id: object.ID,
        category: database.getOrCreate('ItemCategory', object.category_ID),
        code: object.code,
        defaultPackSize: 1, // Every item batch in mobile should be pack-to-one
        defaultPrice: packSize ? parseNumber(object.buy_price) / packSize : 0,
        department: database.getOrCreate('ItemDepartment', object.department_ID),
        description: object.description,
        name: object.item_name,
        crossReferenceItem: database.getOrCreate('Item', object.cross_ref_item_ID),
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'ItemCategory': {
      internalobject = {
        id: object.ID,
        name: object.Description,
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'ItemDepartment': {
      internalobject = {
        id: object.ID,
        name: object.department,
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'ItemBatch': {
      const item = database.getOrCreate('Item', object.item_ID);
      const packSize = parseNumber(object.pack_size);
      internalobject = {
        id: object.ID,
        item: item,
        packSize: 1, // Every item batch in mobile should be pack-to-one
        numberOfPacks: parseNumber(object.quantity) * packSize,
        expiryDate: parseDate(object.expiry_date),
        batch: object.batch,
        costPrice: packSize ? parseNumber(object.sell_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(object.sell_price) / packSize : 0,
        supplier: database.getOrCreate('Name', object.name_ID),
      };
      const itemBatch = database.update(objectType, internalobject);
      item.addBatchIfUnique(itemBatch);
      database.save('Item', item);
      break;
    }
    case 'ItemStoreJoin': {
      const joinsThisStore = object.store_ID === settings.get(THIS_STORE_ID);
      internalobject = {
        id: object.ID,
        itemId: object.item_ID,
        joinsThisStore: joinsThisStore,
      };
      database.update(objectType, internalobject);
      if (joinsThisStore) {
        // If it joins this store, set the item's visibility
        const item = database.getOrCreate('Item', object.item_ID);
        item.isVisible = !parseBoolean(object.inactive);
        database.save('Item', item);
      }
      break;
    }
    // LocalListItem not a class defined in our realm. The structure from mSupply
    // will be replaced by storing equivalent infomation in a MasterList. LocalListItem
    // objects will be mapped to MasterListItems in sync.
    case 'LocalListItem': {
      const item = database.getOrCreate('Item', object.item_ID);
      // Grabbing the masterList using list_master_name_join_ID as the join's id is used in mobile
      // to mimic the local list join with a MasterList.
      const masterList = database.getOrCreate('MasterList', object.list_master_name_join_ID);

      internalobject = {
        id: object.ID,
        item: item,
        imprestQuantity: parseNumber(object.imprest_quantity),
        masterList: masterList,
      };
      const localListItem = database.update('MasterListItem', internalobject);
      masterList.addItemIfUnique(localListItem);
      break;
    }
    case 'MasterListNameJoin': {
      const name = database.getOrCreate('Name', object.name_ID);
      let masterList;
      if (!object.list_master_ID) {
        // mSupply list_local_line don't have a list_master_ID, map the join to a MasterList
        masterList = database.getOrCreate('MasterList', object.ID);
        masterList.name = object.description;
        database.save('MasterList', masterList);
      } else {
        // Regular MasterListNameJoin
        masterList = database.getOrCreate('MasterList', object.list_master_ID);
        internalobject = {
          id: object.ID,
          name: name,
          masterList: masterList,
        };
        database.update(objectType, internalobject);
      }

      name.addMasterListIfUnique(masterList);
      database.save('Name', name);
      break;
    }
    case 'MasterList': {
      internalobject = {
        id: object.ID,
        name: object.description,
        note: object.note,
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'MasterListItem': {
      const masterList = database.getOrCreate('MasterList', object.item_master_ID);
      internalobject = {
        id: object.ID,
        item: database.getOrCreate('Item', object.item_ID),
        imprestQuantity: parseNumber(object.imprest_quan),
        masterList: masterList,
      };
      const masterListItem = database.update(objectType, internalobject);
      masterList.addItemIfUnique(masterListItem);
      break;
    }
    case 'Name': {
      internalobject = {
        id: object.ID,
        name: object.name,
        code: object.code,
        phoneNumber: object.phone,
        billingAddress: getOrCreateAddress(
          database,
          object.bill_address1,
          object.bill_address2,
          object.bill_address3,
          object.bill_address4,
          object.bill_postal_zip_code,
        ),
        emailAddress: object.email,
        type: NAME_TYPES.translate(object.type, EXTERNAL_TO_INTERNAL),
        isCustomer: parseBoolean(object.customer),
        isSupplier: parseBoolean(object.supplier),
        isManufacturer: parseBoolean(object.manufacturer),
        supplyingStoreId: object.supplying_store_id,
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'NameStoreJoin': {
      const joinsThisStore = object.store_ID === settings.get(THIS_STORE_ID);
      internalobject = {
        id: object.ID,
        nameId: object.name_ID,
        joinsThisStore: joinsThisStore,
      };
      database.update(objectType, internalobject);
      if (joinsThisStore) {
        // If it joins this store, set the name's visibility
        const name = database.getOrCreate('Name', object.name_ID);
        name.isVisible = !parseBoolean(object.inactive);
        database.save('Name', name);
      }
      break;
    }
    case 'NumberSequence': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(object.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      // Don't accept updates to number sequences
      if (
        database.objects('NumberSequence').filtered('sequenceKey == $0', sequenceKey).length > 0
      ) {
        break;
      }
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store
      internalobject = {
        id: object.ID,
        sequenceKey: sequenceKey,
        highestNumberUsed: parseNumber(object.value),
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'NumberToReuse': {
      const thisStoreId = settings.get(THIS_STORE_ID);
      const sequenceKey = SEQUENCE_KEYS.translate(object.name, EXTERNAL_TO_INTERNAL, thisStoreId);
      if (!sequenceKey) break; // If translator returns a null key, sequence is not for this store
      const numberSequence = database.getOrCreate('NumberSequence', sequenceKey, 'sequenceKey');
      internalobject = {
        id: object.ID,
        numberSequence: numberSequence,
        number: parseNumber(object.number_to_use),
      };
      const numberToReuse = database.update(objectType, internalobject);
      // Attach the number to reuse to the number seqeunce
      numberSequence.addNumberToReuse(numberToReuse);
      break;
    }
    case 'Requisition': {
      let status = REQUISITION_STATUSES.translate(object.status, EXTERNAL_TO_INTERNAL);
      // If not a special wp or wf status, use the normal status translation
      if (!status) status = STATUSES.translate(object.status, EXTERNAL_TO_INTERNAL);
      internalobject = {
        id: object.ID,
        status: REQUISITION_STATUSES.translate(object.status, EXTERNAL_TO_INTERNAL),
        entryDate: parseDate(object.date_entered),
        daysToSupply: parseNumber(object.daysToSupply),
        serialNumber: object.serial_number,
        requesterReference: object.requester_reference,
        comment: object.comment,
        enteredBy: database.getOrCreate('User', object.user_ID),
        type: REQUISITION_TYPES.translate(object.type, EXTERNAL_TO_INTERNAL),
        otherStoreName: database.getOrCreate('Name', object.name_ID),
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'RequisitionItem': {
      const requisition = database.getOrCreate('Requisition', object.requisition_ID);
      internalobject = {
        id: object.ID,
        requisition: requisition,
        item: database.getOrCreate('Item', object.item_ID),
        stockOnHand: parseNumber(object.stock_on_hand),
        dailyUsage: parseNumber(object.daily_usage),
        requiredQuantity: parseNumber(object.Cust_stock_order),
        suppliedQuantity: parseNumber(object.actualQuan),
        comment: object.comment,
        sortIndex: parseNumber(object.line_number),
      };
      const requisitionItem = database.update(objectType, internalobject);
      requisition.addItemIfUnique(requisitionItem); // requisitionItem will be an orphan object if it's not unique?
      database.save('Requisition', requisition);
      break;
    }
    case 'Stocktake': {
      internalobject = {
        id: object.ID,
        name: object.Description,
        createdDate: parseDate(object.stock_take_created_date),
        stocktakeDate: parseDate(object.stock_take_date, object.stock_take_time),
        status: STATUSES.translate(object.status, EXTERNAL_TO_INTERNAL),
        createdBy: database.getOrCreate('User', object.created_by_ID),
        finalisedBy: database.getOrCreate('User', object.finalised_by_ID),
        comment: object.comment,
        serialNumber: object.serial_number,
        additions: database.getOrCreate('Transaction', object.invad_additions_ID),
        reductions: database.getOrCreate('Transaction', object.invad_reductions_ID),
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'StocktakeBatch': {
      const stocktake = database.getOrCreate('Stocktake', object.stock_take_ID);
      const packSize = parseNumber(object.snapshot_packsize);
      const itemBatch = database.getOrCreate('ItemBatch', object.item_line_ID);
      const item = database.getOrCreate('Item', object.item_ID);
      itemBatch.item = item;
      item.addBatchIfUnique(itemBatch);
      internalobject = {
        id: object.ID,
        stocktake: stocktake,
        itemBatch: itemBatch,
        snapshotNumberOfPacks: parseNumber(object.snapshot_qty) * packSize,
        packSize: 1, // Pack to one all mobile data
        expiryDate: parseDate(object.expiry),
        batch: object.Batch,
        costPrice: packSize ? parseNumber(object.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(object.sell_price) / packSize : 0,
        countedNumberOfPacks: parseNumber(object.stock_take_qty) * packSize,
        sortIndex: parseNumber(object.line_number),
      };
      const stocktakeBatch = database.update(objectType, internalobject);
      stocktake.addBatchIfUnique(database, stocktakeBatch);
      database.save('Stocktake', stocktake);
      break;
    }
    case 'Transaction': {
      if (object.store_ID !== settings.get(THIS_STORE_ID)) break; // Not for this store
      const otherParty = database.getOrCreate('Name', object.name_ID);
      const enteredBy = database.getOrCreate('User', object.user_ID);
      const linkedRequisition = object.requisition_ID
        ? database.getOrCreate('Requisition', object.requisition_ID)
        : null;
      const category = database.getOrCreate('TransactionCategory', object.category_ID);
      internalobject = {
        id: object.ID,
        serialNumber: object.invoice_num,
        comment: object.comment,
        entryDate: parseDate(object.entry_date),
        type: TRANSACTION_TYPES.translate(object.type, EXTERNAL_TO_INTERNAL),
        status: STATUSES.translate(object.status, EXTERNAL_TO_INTERNAL),
        confirmDate: parseDate(object.confirm_date),
        theirRef: object.their_ref,
        category,
        enteredBy,
        otherParty,
        linkedRequisition,
      };
      const transaction = database.update(objectType, internalobject);
      if (linkedRequisition) {
        database.update('Requisition', {
          id: linkedRequisition.id,
          linkedTransaction: transaction,
        });
      }
      otherParty.addTransactionIfUnique(transaction);
      database.save('Name', otherParty);
      break;
    }
    case 'TransactionCategory': {
      internalobject = {
        id: object.ID,
        name: object.category,
        code: object.code,
        type: TRANSACTION_TYPES.translate(object.type, EXTERNAL_TO_INTERNAL),
      };
      database.update(objectType, internalobject);
      break;
    }
    case 'TransactionBatch': {
      const transaction = database.getOrCreate('Transaction', object.transaction_ID);
      const itemBatch = database.getOrCreate('ItemBatch', object.item_line_ID);
      const item = database.getOrCreate('Item', object.item_ID);
      itemBatch.item = item;
      item.addBatchIfUnique(itemBatch);
      const packSize = parseNumber(object.pack_size);
      internalobject = {
        id: object.ID,
        itemId: object.item_ID,
        itemName: object.item_name,
        itemBatch: itemBatch,
        packSize: 1, // Pack to one all mobile data
        numberOfPacks: parseNumber(object.quantity) * packSize,
        numberOfPacksSent: parseNumber(object.quantity) * packSize,
        transaction: transaction,
        note: object.note,
        costPrice: packSize ? parseNumber(object.cost_price) / packSize : 0,
        sellPrice: packSize ? parseNumber(object.sell_price) / packSize : 0,
        sortIndex: parseNumber(object.line_number),
        expiryDate: parseDate(object.expiry_date),
        batch: object.batch,
      };
      const transactionBatch = database.update(objectType, internalobject);
      transaction.addBatchIfUnique(database, transactionBatch);
      database.save('Transaction', transaction);
      itemBatch.addTransactionBatchIfUnique(transactionBatch);
      database.save('ItemBatch', itemBatch);
      break;
    }
    default:
      break; // Silently ignore object types we don't want to sync into mobile
  }
}

/**
 * Delete the object with the given id, relying on its destructor to initiate any
 * changes that are required to clean up that type of object.
 * @param  {Realm}  database   App wide local database
 * @param  {string} objectType Internal object type
 * @param  {string} primaryKey       The primary key of the database object, usually its id
 * @param  {string} primaryKeyField  The field used as the primary key, defaults to 'id'
 * @return {none}
 */
function deleteobject(database, objectType, primaryKey, primaryKeyField = 'id') {
  // 'delete' is a reserved word, deleteobject is in the upper scope, so here we have:
  const obliterate = () => {
    const deleteResults = database
      .objects(objectType)
      .filtered(`${primaryKeyField} == $0`, primaryKey);
    if (deleteResults && deleteResults.length > 0) database.delete(objectType, deleteResults[0]);
  };

  switch (objectType) {
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
      deleteobject(database, 'MasterListItem', primaryKey, primaryKeyField);
      break;
    case 'MasterListNameJoin': {
      // Joins for local lists are mapped to and mimicked by a MasterList of the same id.
      const masterList = database.objects('MasterList').filtered('id == $0', primaryKey)[0];
      if (masterList) {
        // Is a local list, so delete the MasterList that was created for it.
        deleteobject(database, 'MasterList', primaryKey, primaryKeyField);
      } else {
        // Delete the MasterListNameJoin as in the normal/expected case.
        obliterate();
      }
      break;
    }
    default:
      break; // Silently ignore object types we don't want to sync into mobile
  }
}

/**
 * Ensure the given object has the right data to create an internal object of the
 * given objectType. We check only that it is a recognised object type, and that it contains values
 * for all expected keys, but not what those values are (so the content of the object itself could
 * be unexpected or invalid, and we wouldn't detect it)
 * @param  {string} objectType The internal object type this sync object should be used for
 * @param  {object} object     The data from the sync object
 * @return {boolean}           Whether the data is sufficient to create an internal object from
 */
export function sanityCheckIncomingobject(objectType, object) {
  if (!object.ID || object.ID.length < 1) return false; // Every object needs an ID
  const requiredFields = {
    Item: {
      cannotBeBlank: ['code', 'item_name'],
      canBeBlank: ['default_pack_size'],
    },
    ItemCategory: {
      cannotBeBlank: [],
      canBeBlank: ['Description'],
    },
    ItemDepartment: {
      cannotBeBlank: [],
      canBeBlank: ['department'],
    },
    ItemBatch: {
      cannotBeBlank: ['item_ID', 'quantity'],
      canBeBlank: ['pack_size', 'batch', 'expiry_date', 'cost_price', 'sell_price'],
    },
    ItemStoreJoin: {
      cannotBeBlank: ['item_ID', 'store_ID'],
      canBeBlank: [],
    },
    LocalListItem: {
      cannotBeBlank: ['item_ID', 'list_master_name_join_ID'],
      canBeBlank: [],
    },
    MasterListNameJoin: {
      cannotBeBlank: ['name_ID', 'list_master_ID'],
      canBeBlank: ['description'],
    },
    MasterList: {
      cannotBeBlank: [],
      canBeBlank: ['description'],
    },
    MasterListItem: {
      cannotBeBlank: ['item_ID'],
      canBeBlank: [],
    },
    Name: {
      cannotBeBlank: ['type', 'customer', 'supplier', 'manufacturer'],
      canBeBlank: ['name', 'code'],
    },
    NameStoreJoin: {
      cannotBeBlank: ['name_ID', 'store_ID'],
      canBeBlank: ['name_ID', 'store_ID'],
    },
    NumberSequence: {
      cannotBeBlank: ['name', 'value'],
      canBeBlank: [],
    },
    NumberReuse: {
      cannotBeBlank: ['name', 'number_to_use'],
      canBeBlank: [],
    },
    Requisition: {
      cannotBeBlank: ['status', 'type', 'daysToSupply'],
      canBeBlank: ['date_entered', 'serial_number', 'requester_reference'],
    },
    RequisitionItem: {
      cannotBeBlank: ['requisition_ID', 'item_ID'],
      canBeBlank: ['stock_on_hand', 'Cust_stock_order'],
    },
    Stocktake: {
      cannotBeBlank: ['status'],
      canBeBlank: ['Description', 'stock_take_created_date', 'serial_number'],
    },
    StocktakeBatch: {
      cannotBeBlank: [
        'stock_take_ID',
        'item_line_ID',
        'item_ID',
        'snapshot_qty',
        'snapshot_packsize',
      ],
      canBeBlank: ['expiry', 'Batch', 'cost_price', 'sell_price'],
    },
    Transaction: {
      cannotBeBlank: ['name_ID', 'type', 'status', 'store_ID'],
      canBeBlank: ['invoice_num', 'entry_date'],
    },
    TransactionCategory: {
      cannotBeBlank: [],
      canBeBlank: ['category', 'code', 'type'],
    },
    TransactionBatch: {
      cannotBeBlank: [
        'item_ID',
        'item_line_ID',
        'expiry_date',
        'quantity',
        'cost_price',
        'sell_price',
      ],
      canBeBlank: ['item_name', 'batch', 'expiry_date', 'pack_size', 'cost_price', 'sell_price'],
    },
  };
  if (!requiredFields[objectType]) return false; // Unsupported object type
  const hasAllNonBlankFields = requiredFields[objectType].cannotBeBlank.reduce(
    (containsAllFieldsSoFar, fieldName) =>
      containsAllFieldsSoFar &&
      object[fieldName] !== null && // Key must exist
      object[fieldName].length > 0, // And must not be blank
    true,
  );
  if (!hasAllNonBlankFields) return false; // Return early if object already not valid
  const hasRequiredFields = requiredFields[objectType].canBeBlank.reduce(
    (containsAllFieldsSoFar, fieldName) =>
      containsAllFieldsSoFar &&
      object[fieldName] !== null && // Key must exist
      object[fieldName] !== undefined, // May be blank, i.e. just ''
    hasAllNonBlankFields,
  ); // Start containsAllFieldsSoFar as result from hasAllNonBlankFields
  return hasRequiredFields;
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
