export { createRecord, generateUUID, getNumberSequence } from './utilities';
export { schema } from './schema';
export { Database } from './Database';
export { UIDatabase } from './UIDatabase';

export const CHANGE_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  WIPE: 'wipe',
};

export const SERIAL_NUMBER_KEYS = {
  CUSTOMER_INVOICE: 'customer_invoice_serial_number',
  REQUISITION: 'requisition_serial_number',
  STOCKTAKE: 'stocktake_serial_number',
};
