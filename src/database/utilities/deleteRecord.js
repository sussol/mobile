/**
 * Delete the record with the given id, relying on its destructor to initiate any
 * changes that are required to clean up that type of record.
 * @param  {Realm}  database   App wide local database
 * @param  {string} recordType Internal record type
 * @param  {string} primaryKey       The primary key of the database object, usually its id
 * @param  {string} primaryKeyField  The field used as the primary key, defaults to 'id'
 * @return {none}
 */
export function deleteRecord(
  database,
  recordType,
  primaryKey,
  primaryKeyField = 'id',
) {
  // 'delete' is a reserved word, deleteRecord is in the upper scope, so here we have:
  const obliterate = () => {
    const deleteResults = database
      .objects(recordType)
      .filtered(`${primaryKeyField} == $0`, primaryKey);
    if (deleteResults && deleteResults.length > 0) {
      database.delete(recordType, deleteResults[0]);
    }
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
      const masterList = database
        .objects('MasterList')
        .filtered('id == $0', primaryKey)[0];
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
