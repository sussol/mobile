/**
 * All utility functions for processing synced records after being synced. These changes
 * should be detected by SyncQueue and sent back to the server on next sync.
 */

import { getNextNumber, NUMBER_SEQUENCE_KEYS } from '../database/utilities';

const { REQUISITION_SERIAL_NUMBER, SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

import autobind from 'react-autobind';

export class PostSyncProcessor {
  constructor(database) {
    this.database = database;
    this.recordQueue = new Map(); // Map of [recordId, recordType]
    this.actionQueue = [];
    autobind(this);
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
    // Exit if not a change caused by incoming sync
    if (causedBy !== 'sync' || recordType === 'SyncOut') return;
    if (this.recordQueue.has(record.id)) {
      // Check if already in queue, remove old
      this.recordQueue.delete(record.id);
    }
    // Add new entry at end of Map
    this.recordQueue.set(record.id, recordType);
  }

  /**
   * Runs post sync checks across specified tables, ensuring data is correct.
   * Tables manually added as to not iterate over tables that don't have any post processing.
   */
  processAnyUnprocessedRecords() {
    this.actionQueue = [];
    this.recordQueue = []; // Reset the recordQueue to avoid unnessary runs

    this.database
      .objects('Requisition')
      .forEach(record => this.enqueuePostProcessesForRecordType('Requisition', record));

    this.database
      .objects('Transaction')
      .forEach(record => this.enqueuePostProcessesForRecordType('Transaction', record));

    this.runActionQueue();
  }

  /**
   * Iterates through records added through listening to sync, adding needed actions
   * to actionQueue. Runs the actionQueue, making the changes.
   */
  processRecordQueue() {
    this.recordQueue.forEach((recordType, recordId) => {
      // Use local database record, not what comes in sync. Ensures that records are
      // integrated information (definitely after sync is done)
      const internalRecord = this.database.objects(recordType).filtered('id == $0', recordId)[0];
      this.enqueuePostProcessesForRecordType(recordType, internalRecord);
    });
    this.runActionQueue();
    this.recordQueue = []; // Reset the recordQueue to avoid unnessary reruns
  }

  /**
   * Runs all the post sync functions triggered by sync events on database through
   * this.onDatabaseEvent
   */
  runActionQueue() {
    this.database.write(() => this.actionQueue.forEach(func => func()));
    this.actionQueue = [];
  }

  /**
   * Delegates records to the correct utility function
   * @param  {string} recordType  The type of record changed (from database schema)
   * @param  {object} record      The record changed
   * @return {none}
   */
  enqueuePostProcessesForRecordType(recordType, record) {
    switch (recordType) {
      case 'Requisition':
        this.actionQueue = this.actionQueue.concat(this.generateFunctionsForRequisition(record));
        break;
      case 'Transaction':
        this.actionQueue = this.actionQueue.concat(this.generateFunctionsForTransaction(record));
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
  generateFunctionsForRequisition(record) {
    const funcs = [];
    // Allocate serial number to requisitions with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.

    if (record.serialNumber === '-1') {
      funcs.push(() => {
        record.serialNumber = getNextNumber(this.database, REQUISITION_SERIAL_NUMBER);
      });
    }

    if (funcs.length > 0) {
      funcs.push(() => this.database.update('Requisition', record));
    }

    return funcs;
  }

  /**
   * Builds an array of post process functions based on conditions, runs a database write call
   * to apply all the post process functions if there are any.
   * @param  {object} record     The record changed
   * @return {array}  An array of functions to be called for the given record
   */
  generateFunctionsForTransaction(record) {
    const funcs = [];
    // Allocate serial number to supplier invoices with serial number of -1. This has been generated
    // by the server, coming from another store as supplier.
    if (record.serialNumber === '-1' && record.type === 'supplier_invoice') {
      funcs.push(() => {
        record.serialNumber = getNextNumber(this.database, SUPPLIER_INVOICE_NUMBER);
      });
    }

    // If any changes, add database update for record
    if (funcs.length > 0) {
      funcs.push(() => this.database.update('Transaction', record));
    }

    return funcs;
  }
}
