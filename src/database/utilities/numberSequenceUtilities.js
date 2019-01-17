import { createRecord } from './createRecord';

export const NUMBER_SEQUENCE_KEYS = {
  CUSTOMER_INVOICE_NUMBER: 'customer_invoice_serial_number',
  INVENTORY_ADJUSTMENT_SERIAL_NUMBER: 'inventory_adjustment_serial_number',
  REQUISITION_SERIAL_NUMBER: 'requisition_serial_number',
  REQUISITION_REQUESTER_REFERENCE: 'requisition_requester_reference',
  STOCKTAKE_SERIAL_NUMBER: 'stocktake_serial_number',
  SUPPLIER_INVOICE_NUMBER: 'supplier_invoice_serial_number',
};

// Get the next highest number in an existing number sequence
export function getNextNumber(database, sequenceKey) {
  const numberSequence = getNumberSequence(database, sequenceKey);
  const number = numberSequence.getNextNumber(database);
  database.save('NumberSequence', numberSequence);
  return String(number);
}

// Put a number back into a sequence for reuse
export function reuseNumber(database, sequenceKey, number) {
  const numberSequence = getNumberSequence(database, sequenceKey);
  numberSequence.reuseNumber(database, parseInt(number, 10)); // Base 10
  database.save('NumberSequence', numberSequence);
}

// Find and return the sequence with the given key
export function getNumberSequence(database, sequenceKey) {
  const sequenceResults = database
    .objects('NumberSequence')
    .filtered('sequenceKey == $0', sequenceKey);
  if (sequenceResults.length > 1) {
    throw new Error(`More than one ${sequenceKey} sequence`);
  }
  if (sequenceResults.length <= 0) {
    return createRecord(database, 'NumberSequence', sequenceKey);
  }
  return sequenceResults[0];
}
