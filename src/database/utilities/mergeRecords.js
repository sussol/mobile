import { createOrUpdateRecord } from '../../sync/incomingSyncUtils';
import { deleteRecord } from './deleteRecord';

// Translations for merge logic.
// TODO: bind translations to DataType constants to avoid breakage on schema update.
const RECORD_TYPE_TO_TABLE = {
  Item: {
    StocktakeItem: {
      field: 'item',
    },
    TransactionItem: {
      field: 'item',
    },
    ItemBatch: {
      field: 'item',
    },
    RequisitionItem: {
      field: 'item',
    },
  },
  Name: {
    ItemBatch: {
      field: 'supplier',
    },
    Transaction: {
      field: 'otherParty',
      setterMethod: 'setOtherParty',
    },
    Requisition: {
      field: 'otherStoreName',
    },
  },
};

const RECORD_TYPE_TO_MASTERLIST = {
  Item: {
    MasterListItem: {
      field: 'item',
    },
  },
  Name: {
    MasterListNameJoin: {
      field: 'name',
    },
  },
};

/**
 * Merge two existing records. One record is retained and the other is merged. After the objects
 * are merged, the merged object is deleted from the database. The merge operation updates the
 * fields of the retained record to reference the same data as the merged object.
 *
 * @param {Realm}  database           The local database
 * @param {object} settings           Access to app settings
 * @param {string} internalRecordType Internal record type for merge operation
 * @param {object} syncRecord         Data representing the sync record
 */
export function mergeRecords(database, settings, internalRecordType, syncRecord) {
  const recordToKeep = database
    .objects(internalRecordType)
    .filtered('id == $0', syncRecord.mergeIDtokeep)[0];
  const recordToMerge = database
    .objects(internalRecordType)
    .filtered('id == $0', syncRecord.mergeIDtodelete)[0];
  const recordsExist = recordToKeep && recordToMerge;
  if (!recordsExist) return;
  const tablesToUpdate = RECORD_TYPE_TO_TABLE[internalRecordType];
  if (!tablesToUpdate) return; // TODO: log to bugsnag if merging not implemented for a certain recordType.

  Object.entries(tablesToUpdate).forEach(
    ([tableToUpdate, { field: fieldToUpdate, setterMethod: fieldSetter }]) => {
      const recordsToUpdate = database
        .objects(tableToUpdate)
        .filtered(`${fieldToUpdate}.id == $0`, recordToMerge.id)
        .snapshot();
      recordsToUpdate.forEach((record) => {
        if (record) {
          if (typeof record[fieldSetter] === typeof Function) record[fieldSetter](recordToKeep);
          else record[fieldToUpdate] = recordToKeep;
        }
      });
    },
  );

  const [[tableToUpdate, { field: fieldToUpdate }]] = Object.entries(
    RECORD_TYPE_TO_MASTERLIST[internalRecordType],
  );
  const masterListJoinRecords = database
    .objects(tableToUpdate)
    .filtered(`${fieldToUpdate}.id == $0`, recordToMerge.id)
    .snapshot()
    .forEach((joinRecord) => {
      const duplicateJoinRecord = database
        .objects(tableToUpdate)
        .filtered(
          `(${fieldToUpdate}.id == $0) && (masterList.id == $0)`,
          recordToKeep.id,
          joinRecord.masterList.id,
        )[0];
      if (duplicateJoinRecord) {
        deleteRecord(database, tableToUpdate, joinRecord.id);
      } else {
        joinRecord[fieldToUpdate] = recordToKeep;
        createOrUpdateRecord(database, settings, tableToUpdate, joinRecord);
      }
    });

  switch (internalRecordType) {
    case 'Item':
      recordToMerge.batches.forEach((batch) => {
        recordToKeep.addBatchIfUnique(batch);
      });
      const batch = database
        .objects('TransactionBatch')
        .filtered('itemId == $0', recordToMerge.id)
        .snapshot()
        .forEach((batch) => {
          batch.itemId = recordToKeep.id;
        });

      // createOrUpdateRecord(database, settings, 'TransactionBatch', batch);
      break;
    case 'Name':
      recordToMerge.masterLists.forEach((masterList) => {
        recordToKeep.addMasterListIfUnique(masterList);
      });
      break;
  }

  recordToKeep.isVisible = recordToKeep.isVisible || recordToMerge.isVisible;

  deleteRecord(database, internalRecordType, recordToMerge.id);
}
