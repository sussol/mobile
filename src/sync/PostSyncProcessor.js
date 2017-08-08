/**
 * All utility functions for processing synced records after being synced. These should changes
 * should be detected by SyncQueue and sent back to the server on next sync.
 */

import { getNextNumber, NUMBER_SEQUENCE_KEYS } from '../database/utilities';

const { REQUISITION_SERIAL_NUMBER, SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

export class PostSyncProcessor {
  constructor(database) {
    this.database = database;
    this.recordQueue = [];
    this.actionQueue = [];
    this.checkTables = this.checkTables.bind(this);
    this.processRecordQueue = this.processRecordQueue.bind(this);
    this.onDatabaseEvent = this.onDatabaseEvent.bind(this);
    this.runActionQueue = this.runActionQueue.bind(this);
    this.delegateByRecordType = this.delegateByRecordType.bind(this);
    this.postProcessRequisition = this.postProcessRequisition.bind(this);
    this.postProcessTransaction = this.postProcessTransaction.bind(this);

    this.database.addListener(this.onDatabaseEvent);
  }

/**
 * Respond to a database change event. Must be called from within a database
 * write transaction.
 * @param  {string} changeType  The type of database change, e.g. CREATE, UPDATE, DELETE
 * @param  {string} recordType  The type of record changed (from database schema)
 * @param  {object} record      The record changed
 * @param  {string} causedBy    The cause of this database event, either 'sync' or undefined
 * @return {none}
 * Runs all the post sync functions triggered by sync events on database through
 * this.onDatabaseEvent
 */
  onDatabaseEvent(changeType, recordType, record, causedBy) {
    console.log('event: ', causedBy, recordType);
    if (causedBy !== 'sync') return; // Exit if not a change caused by sync
    this.recordQueue.push({ recordType, recordId: record.id });
  }

  /**
   * Runs post checks across tables, ensuring data is correct.
   * Tables manually added as to not iterate over tables that don't have any post processing.
   */
  checkTables() {
    this.actionQueue = [];
    this.recordQueue = []; // Reset the recordQueue to avoid unnessary runs

    this.database
      .objects('Requisition')
      .forEach(record => this.delegateByRecordType('Requisition', record));

    this.database
      .objects('Transaction')
      .forEach(record => this.delegateByRecordType('Transaction', record));

    this.runActionQueue();
  }

  /**
   * Iterates through records added through listening to sync, adding needed actions
   * to actionQueue. Runs the action actionQueue, making the changes.
   */
  processRecordQueue() {
    this.recordQueue.forEach(({ recordType, recordId }) => {
      // Use local database record, not what comes in sync. Ensures that records aren't
      // processed twice.
      // Example: Record might have serialNumber -1, if it went through incoming sync twice
      // it'd first assign a serial number, then assign it again with the next number.
      // Using local database record means that'll changes will only happen on first pass.
      const internalRecord = this.database.objectForPrimaryKey(recordType, recordId);
      this.delegateByRecordType(recordType, internalRecord);
    });
    this.runActionQueue();
  }

  /**
   * Runs all the post sync functions triggered by sync events on database through
   * this.onDatabaseEvent
   */
  runActionQueue() {
    console.log('Running actionQueue: ', this.actionQueue.length);
    this.database.write(() => this.actionQueue.forEach(func => func()));
    this.actionQueue = [];
  }

  /**
   * Delegates records to the correct utility function
   * @param  {string} recordType  The type of record changed (from database schema)
   * @param  {object} record      The record changed
   * @return {none}
   */
  delegateByRecordType(recordType, record) {
    console.log('Delegate', recordType);
    switch (recordType) {
      case 'Requisition':
        this.actionQueue = this.actionQueue.concat(this.postProcessRequisition(record));
        break;
      case 'Transaction':
        this.actionQueue = this.actionQueue.concat(this.postProcessTransaction(record));
        break;
      default:
        break;
    }
  }

  /**
   * Builds an array of post process functions based on conditions, runs a database write call
   * to apply all the post process functions if there are any.
   * @param  {object} record     The record changed
   * @return {array}  An array of functions to be called for the given record
   */
  postProcessRequisition(record) {
    const processes = [];
    // Allocate serial number to requisitions with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.
    console.log('in func, serial: ', record.serialNumber);
    if (record.serialNumber === '-1') {
      processes.push(() => {
        console.log('reqbefore', record.serialNumber);
        record.serialNumber = getNextNumber(this.database, REQUISITION_SERIAL_NUMBER);
        console.log('reqafter', record.serialNumber);
      });
    }

    if (processes.length > 0) {
      processes.push(() => this.database.update('Requisition', record));
    }
    console.log('processes: ', processes);
    return processes;
  }

  /**
   * Builds an array of post process functions based on conditions, runs a database write call
   * to apply all the post process functions if there are any.
   * @param  {object} record     The record changed
   * @return {array}  An array of functions to be called for the given record
   */
  postProcessTransaction(record) {
    const processes = [];
    // Allocate serial number to supplier invoices with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.
    if (record.serialNumber === '-1' && record.type === 'supplier_invoice') {
      processes.push(() => {
        console.log('supbefore', record.serialNumber);
        record.serialNumber = getNextNumber(this.database, SUPPLIER_INVOICE_NUMBER);
        console.log('reqafter', record.serialNumber);
      });
    }

    // If any changes, add database update for record
    if (processes.length > 0) {
      processes.push(() => this.database.update('Transaction', record));
    }
    console.log('end');
    return processes;
  }
}
