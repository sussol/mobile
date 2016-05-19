import { CHANGE_TYPES, generateUUID } from '../database';
const { CREATE, UPDATE, DELETE } = CHANGE_TYPES;
const recordTypesSynced = [
  'Item',
  'ItemLine',
  'Transaction',
  'TransactionLine',
];

export class SyncQueue {
  constructor(database) {
    this.database = database;
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.databaseListenerId = null;
  }

  enable() {
    this.databaseListenerId = this.database.addListener(this.onDatabaseEvent);
  }

  disable() {
    this.database.removeListener(this.databaseListenerId);
  }

  /**
   * Must be called from within a database write transaction
   * @param  {[type]} changeType [description]
   * @param  {[type]} recordType [description]
   * @param  {[type]} record     [description]
   * @return {[type]}            [description]
   */
  onDatabaseEvent(changeType, recordType, record) {
    if (recordTypesSynced.indexOf(recordType) >= 0) {
      switch (changeType) {
        case CREATE:
        case UPDATE:
        case DELETE: {
          if (!record.id) return;
          const duplicate = this.database.objects('SyncOut')
                              .filtered(
                                'changeType == $0 && recordType == $1 && recordId == $2',
                                changeType,
                                recordType,
                                record.id)
                              .length > 0;
          if (!duplicate) {
            this.database.create(
              'SyncOut',
              {
                id: generateUUID(),
                changeTime: new Date().getTime(),
                changeType: changeType,
                recordType: recordType,
                recordId: record.id,
              });
          }
          break;
        }
        default: // Not a supported database event, do nothing. E.g. WIPE (takes care of itself)
          break;
      }
    }
  }

  length() {
    return this.database.objects('SyncOut').count;
  }

  next(numberOfRecords) {
    const numberToReturn = numberOfRecords || 1;
    const allRecords = this.database.objects('SyncOut').sorted();
    return allRecords.slice(0, numberToReturn);
  }

  use(records) {
    this.database.write(() => {
      this.database.delete(records);
    });
  }
}
