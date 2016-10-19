export { Database, CHANGE_TYPES, generateUUID } from 'react-native-database';

export { createRecord, getNumberSequence } from './utilities';
export { schema } from './schema';
export { UIDatabase } from './UIDatabase';
export const SERIAL_NUMBER_KEYS = {
  CUSTOMER_INVOICE: 'customer_invoice_serial_number',
  REQUISITION: 'requisition_serial_number',
  STOCKTAKE: 'stocktake_serial_number',
};
