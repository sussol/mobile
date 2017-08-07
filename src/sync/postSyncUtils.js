/**
 * All utility functions for processing synced records after being synced. These should changes
 * should be detected by SyncQueue and sent back to the server on next sync.
 */

import { getNextNumber, NUMBER_SEQUENCE_KEYS } from '../database/utilities';

const { REQUISITION_SERIAL_NUMBER, SUPPLIER_INVOICE_NUMBER } = NUMBER_SEQUENCE_KEYS;


/**
 * Respond to a database change event. Must be called from within a database
 * write transaction.
 * @param  {string} changeType  The type of database change, e.g. CREATE, UPDATE, DELETE
 * @param  {string} recordType  The type of record changed (from database schema)
 * @param  {object} record      The record changed
 * @param  {string} causedBy    The cause of this database event, either 'sync' or undefined
 * @param  {Realm}  database    The local database
 * @return {none}
 */
export function postSyncProcessor(changeType, recordType, record, causedBy, database) {
  console.log('event?: ', recordType, causedBy);
  if (causedBy !== 'sync') return; // Exit if not a change caused by sync
  // Delegates incoming sync records to the correct post processing utility function
  switch (recordType) {
    case 'Requisition':
      postProcessRequisition(database, record);
      break;
    case 'Transaction':
      postProcessTransaction(database, record);
      break;
    default:
      break;
  }
}

/**
 * Builds an array of post process functions based on conditions, runs a database write call
 * to apply all the post process functions if there are any.
 * @param  {Realm}  database   The local database
 * @param  {object} record     The record changed
 * @return {none}
 */
function postProcessRequisition(database, record) {
  const processes = [];
  // Allocate serial number to requisitions with serial number of -1. This has been generated
  // by the server, coming from another store as supplier.
  if (record.serialNumber === '-1') {
    processes.push(() => {
      console.log('reqbefore', record.serialNumber);
      record.serialNumber = getNextNumber(database, REQUISITION_SERIAL_NUMBER);
      console.log('reqafter', record.serialNumber);
    });
  }

  if (processes.length > 0) {
    processes.forEach(func => func());
    database.update('Requisition', record);
  }
}

/**
 * Builds an array of post process functions based on conditions, runs a database write call
 * to apply all the post process functions if there are any.
 * @param  {Realm}  database   The local database
 * @param  {object} record     The record changed
 * @return {none}
 */
function postProcessTransaction(database, record) {
  const processes = [];
  // Allocate serial number to supplier invoices with serial number of -1. This has been generated
  // by the server, coming from another store as supplier.
  if (record.serialNumber === '-1' && record.type === 'supplier_invoice') {
    processes.push(() => {
      console.log('supbefore', record.serialNumber);
      record.serialNumber = getNextNumber(database, SUPPLIER_INVOICE_NUMBER);
      console.log('reqafter', record.serialNumber);
    });
  }

  if (processes.length > 0) {
    processes.forEach(func => func());
    database.update('Transaction', record);
  }
  console.log('end');
}
