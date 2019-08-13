import { generateUUID } from 'react-native-database';

import { SETTINGS_KEYS } from '../../settings';

/**
 * 2.3.6: An unavoidable situation around the time 2.3.5 was released, delete records
 *       for item lines were synced to mobile. This caused issues having TransactionBatch
 *       records with no related ItemBatch. Solution was to use migration code to
 *       create ItemBatch records for these TransactionBatches with a quantity of zero.
 */

const v2Migrations = [
  {
    version: '2.0.0-rc0',
    migrate: (database, settings) => {
      // Changed |SyncQueue| to expect no more than one 'SyncOut' record for every record in
      // database.
      // Assume that last SyncOut record is correct.
      const allRecords = database
        .objects('SyncOut')
        .sorted('changeTime')
        .snapshot();
      database.write(() => {
        allRecords.forEach(record => {
          const hasDuplicates = allRecords.filtered('recordId == $0', record.id).length > 1;
          if (hasDuplicates) {
            database.delete('SyncOut', record);
          } else if (record.recordType === 'Transaction' || record.recordType === 'Requisition') {
            // 'Transaction' and 'Requisition' records need to be synced after all child records
            // for 2.0.0 interstore features.
            record.changeTime = new Date().getTime();
            database.update('SyncOut', record);
          }
        });
      });
      // A hack to change main supplying store from Adara to SAMES for stores that had Adara PS
      // as supplying store during initial sync.
      if (
        settings.get(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID) ===
          'B1938F4FFDC2074DB5408B435ACEB198' ||
        settings.get(SETTINGS_KEYS.SUPPLYING_STORE_ID) === '734CC3EC70283A4AABC4E645C8B1E11D'
      ) {
        settings.set(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID, 'E5D7BB38571C1F428AF397240EEB285F');
        settings.set(SETTINGS_KEYS.SUPPLYING_STORE_ID, '6CFDCD1916B098478422A489625AB9E7');
      }
      // Migration for v2 API request requisitions, set |otherStoreName| to main supplying store
      // name for all existing requisitions (expect no response requisitions at this stage).
      const supplyingStoreId = settings.get(SETTINGS_KEYS.SUPPLYING_STORE_NAME_ID);
      if (!supplyingStoreId || supplyingStoreId === '') {
        throw new Error('Supplying Store Name ID missing from Settings');
      }

      const requisitions = database
        .objects('Requisition')
        .filtered('otherStoreName == null AND type == "request"')
        .snapshot();
      database.write(() => {
        const mainSupplyingStoreName = database.getOrCreate('Name', supplyingStoreId);

        requisitions.forEach(requisition =>
          database.update('Requisition', {
            id: requisition.id,
            otherStoreName: mainSupplyingStoreName,
            status: requisition.status === 'finalised' ? 'finalised' : 'suggested',
          })
        );
      });

      // Previous versions did not add requisitions, transactions, or stocktakes to the sync queue
      // when they were finalised, causing them to have not been synced to the server in finalised
      // form. Find all of these, and set them to resync.
      database.write(() => {
        // Requisitions
        const finalisedRequisitions = database
          .objects('Requisition')
          .filtered('status == "finalised"');
        finalisedRequisitions.forEach(requisition => database.save('Requisition', requisition));

        // Transactions.
        const finalisedTransactions = database
          .objects('Transaction')
          .filtered('status == "finalised"');
        finalisedTransactions.forEach(transaction => database.save('Transaction', transaction));

        // Stocktakes.
        const finalisedStocktakes = database.objects('Stocktake').filtered('status == "finalised"');
        finalisedStocktakes.forEach(stocktake => database.save('Stocktake', stocktake));
      });
    },
  },
  {
    version: '2.1.0-rc10',
    migrate: database => {
      // If we try to delete a 'TransactionBatch' with a parent transaction with 'confirmed' status,
      // then a 'TransactionBatch' destructor will try to revert stock on related 'ItemBatch'
      // objects. To prevent this, the status of these transactions is temporarily changed.
      const deleteBatches = (inventoryAdjustment, batchesToDelete) => {
        const currentStatus = inventoryAdjustment.status;
        database.write(() => {
          // Dot notation assignment won't fire sync events.
          inventoryAdjustment.status = TEMP_STATUS;
          database.delete('TransactionBatch', batchesToDelete);
          inventoryAdjustment.status = currentStatus;
        });
      };

      const TEMP_STATUS = 'nw';
      const matchBatch = (batches, batchToMatch) =>
        batches.some(batch => batch.id === batchToMatch.id);
      // It was possible to finalise stocktakes twice, creating duplicate batches in
      // 'inventory_adjustment' transactions. This need to cleaned up to avoid discrepancies.
      // This did not affect actual 'ItemBatch' quantity.
      const lines = database
        .objects('TransactionItem')
        .filtered('transaction.otherParty.type == "inventory_adjustment"');
      lines.forEach(line => {
        let batchesToDelete = [];
        const { batches } = line;
        // Add duplicated batch to |batchesToDelete|.
        batches.forEach(batch => {
          if (!matchBatch(batchesToDelete, batch)) {
            batchesToDelete = [
              ...batchesToDelete,
              ...batches.filtered('itemBatch.id == $0 AND id != $1', batch.itemBatch.id, batch.id),
            ];
          }
        });
        // Delete duplicate batches.
        if (batchesToDelete.length > 0) {
          deleteBatches(line.transaction, batchesToDelete);
        }
      });
    },
  },
  {
    version: '2.3.6',
    migrate: database => {
      // Find all the transactions with no item batches, if any
      const transactionBatches = database
        .objects('TransactionBatch')
        .filtered('itemBatch == $0', null)
        .snapshot();
      // Do nothing if there aren't any.
      if (!(transactionBatches.length > 0)) return;
      // For each of these item batchless-transaction batches, create a new
      // 0 quantity item batch
      transactionBatches.forEach(transactionBatch => {
        if (!transactionBatch) return;
        const {
          itemId,
          batch,
          expiryDate,
          packSize,
          costPrice,
          sellPrice,
          donor,
        } = transactionBatch;
        // TransactionBatch are not directly related, just hold a reference. Find
        // the actual Item record.
        const items = database.objects('Item').filtered('id == $0', itemId);
        // Double checking the itemId in an ItemBatch is actually related to an item.
        // Early exit if not, something else is wrong
        if (!items.length > 0) return;
        const item = items[0];
        // Create the new ItemBatch using as much detail from the TransactionBatch
        // as possible
        database.write(() => {
          const newItemBatch = database.update('ItemBatch', {
            id: generateUUID(),
            batch,
            expiryDate,
            packSize,
            costPrice,
            sellPrice,
            donor,
            item,
          });
          // Add the transaction batch into the new item batch
          newItemBatch.transactionBatches.push(transactionBatch);
          database.save('ItemBatch', newItemBatch);
          // Update the TransactionBatch with the newly created ItemBatch
          database.update('TransactionBatch', {
            ...transactionBatch,
            itemBatch: newItemBatch,
          });
        });
      });
    },
  },
];

export default v2Migrations;
