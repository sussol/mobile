import { CHANGE_TYPES, generateUUID } from '../database';
const { CREATE, UPDATE, DELETE } = CHANGE_TYPES;
const recordTypesSynced = [
  'ItemBatch',
  'NumberSequence',
  'NumberToReuse',
  'Requisition',
  'RequisitionItem',
  'Stocktake',
  'StocktakeBatch',
  'Transaction',
  'TransactionBatch',
];

/**
 * Maintains the queue of records to be synced: listens to database changes,
 * queues sync records, provides them when asked, and removes them when marked as
 * used. First changed first out, i.e. the oldest changes are synced first.
 */
export class SyncQueue {
  constructor(database) {
    this.database = database;
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = null;
  }

  /**
   * Start the queue listening to database changes
   * @return {none}
   */
  enable() {
    this.databaseListenerId = this.database.addListener(this.onDatabaseEvent);
  }

  /**
   * Stop the queue listening to database changes
   * @return {none}
   */
  disable() {
    this.database.removeListener(this.databaseListenerId);
  }

  /**
   * Respond to a database change event. Must be called from within a database
   * write transaction.
   * @param  {string} changeType The type of database change, e.g. CREATE, UPDATE, DELETE
   * @param  {string} recordType The type of record changed (from database schema)
   * @param  {object} record     The record changed
   * @param  {string} causedBy   The cause of this database event, either 'sync' or undefined
   * @return {none}
   */
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    if (causedBy === 'sync') return; // Don't re-sync any changes caused by a sync
    if (recordTypesSynced.indexOf(recordType) >= 0) {
      // If a delete, first remove any sync out records that already have the id,
      // so that sync doesn't try to refer to them next time it does a push
      if (changeType === DELETE) {
        const recordsToDelete = this.database
          .objects('SyncOut')
          .filtered('recordId == $0', record.id);
        this.database.delete('SyncOut', recordsToDelete);
      }
      switch (changeType) {
        case CREATE:
        case UPDATE:
        case DELETE: {
          let duplicate = false;
          if (!record.id) return;

          if ((recordType === 'Transaction' || recordType === 'Requisition')
                                            && record.isFinalised) {
            // Remove old snapshots from the same transaction to be sync with lines
            const result = this.database
              .objects('SyncOut')
              .filtered('recordType == $0 && recordId == $1', recordType, record.id);

            Object.entries(result).forEach(([key, value]) => {
              this.database.delete('SyncOut', value);
            });
          } else {
            duplicate =
              this.database
                .objects('SyncOut')
                .filtered(
                  'changeType == $0 && recordType == $1 && recordId == $2',
                  changeType,
                  recordType,
                  record.id
                ).length > 0;
          }

          if (!duplicate) {
            this.database.create('SyncOut', {
              id: generateUUID(),
              changeTime: new Date().getTime(),
              changeType: changeType,
              recordType: recordType,
              recordId: record.id,
            });
          }
          break;
        }
        default:
          // Not a supported database event, do nothing. E.g. WIPE (takes care of itself)
          break;
      }
    }
  }

  /**
   * Return the number of records in the sync queue.
   * @return {integer} Number of records awaiting sync
   */
  get length() {
    return this.database.objects('SyncOut').length;
  }

  /**
   * Return the next x records to be synced.
   * @param  {integer}   numberOfRecords The number of records to return (defaults to 1)
   * @return {array}                     An array of the top x records in the sync queue
   */
  next(numberOfRecords) {
    const numberToReturn = numberOfRecords || 1;
    const allRecords = this.database.objects('SyncOut').sorted('changeTime');
    return allRecords.slice(0, numberToReturn);
  }

  /**
   * Remove the given records from the sync queue.
   * @param  {array} records An array of the records that have been used
   * @return {none}
   */
  use(records) {
    this.database.write(() => {
      this.database.delete('SyncOut', records);
    });
  }
}
