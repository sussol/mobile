/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Delete record by primary key. Relies on class destructors to initiate any changes that are
 * required for clean up.
 *
 * @param   {Realm}   database
 * @param   {string}  recordType       Internal record type.
 * @param   {string}  primaryKey       The primary key of the database object, usually an id field.
 * @param   {string}  primaryKeyField  The field used as the primary key, defaults to 'id'.
 */
export const deleteRecord = (database, recordType, primaryKey, primaryKeyField = 'id') => {
  // 'delete' is a reserved word, |deleteRecord| is in the upper scope.
  const obliterate = () => {
    try {
      const deleteResults = database
        .objects(recordType)
        .filtered(`${primaryKeyField} == $0`, primaryKey);
      if (deleteResults && deleteResults.length > 0) {
        database.delete(recordType, deleteResults[0]);
      }
    } catch {
      // .objects will throw if the record type is not a valid type within the schema.
      // This could happen by receiving delete sync records from the server which are
      // not a part of mSupply mobile. For example, system data which is not used. It is
      // rare, but in this case silently ignore record types which should not be synced to mobile.
    }
  };

  switch (recordType) {
    // Local list item is mimicked with master list item..
    case 'LocalListItem':
      deleteRecord(database, 'MasterListItem', primaryKey, primaryKeyField);
      break;
    case 'MasterListNameJoin': {
      // Joins for local lists are mapped to and mimicked by a masterlist of the same id.
      const masterList = database.objects('MasterList').filtered('id == $0', primaryKey)[0];
      if (masterList) {
        // Local list, delete the masterlist previously created for it.
        deleteRecord(database, 'MasterList', primaryKey, primaryKeyField);
      } else {
        // Delete the 'MasterListNameJoin' as per the usual case.
        obliterate();
      }
      break;
    }
    default:
      obliterate();
  }
};

export default deleteRecord;
