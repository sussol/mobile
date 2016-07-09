export { Database } from './Database';
export { generateUUID } from './utilities';
export { schema } from './schema';
export { createCustomerInvoice, createStocktake, createStocktakeItem } from './creators';

export const CHANGE_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  WIPE: 'wipe',
};
