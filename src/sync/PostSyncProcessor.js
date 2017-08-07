/**
 * All utility functions for processing synced records after being synced. These should changes
 * should be detected by SyncQueue and sent back to the server on next sync.
 */

import { getNextNumber, NUMBER_SEQUENCE_KEYS } from '../database/utilities';

const { REQUISITION_SERIAL_NUMBER, SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;

export class PostSyncProcessor {
  constructor(database) {
    this.database = database;
    this.queue = [];
    this.runPostSyncQueue = this.runPostSyncQueue.bind(this);
    this.checkTables = this.checkTables.bind(this);
  }

  /**
   * Runs post checks across tables, ensuring data is correct.
   * Tables manually added as to not iterate over tables that don't have any post processing.
   */
  checkTables() {
    this.queue = [];

    this.database
      .objects('Requisition')
      .forEach(record => this.delegateByRecordType('Requisition', record));

    this.database
      .objects('Transaction')
      .forEach(record => this.delegateByRecordType('Transaction', record));

    this.runPostSyncQueue();
  }

  /**
   * Runs all the post sync functions triggered by sync events on database through
   * this.onDatabaseEvent
   */
  runPostSyncQueue() {
    console.log('Running post queue: ', this.queue.length);
    this.database.write(() => this.queue.forEach(func => func()));
    this.queue = [];
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
        this.queue = this.queue.concat(this.postProcessRequisition(record));
        break;
      case 'Transaction':
        this.queue = this.queue.concat(this.postProcessTransaction(record));
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
