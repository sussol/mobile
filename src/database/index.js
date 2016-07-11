export { Database } from './Database';
export { generateUUID } from './utilities';
export { schema } from './schema';
export { createRecord } from './createRecord';

export const CHANGE_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  WIPE: 'wipe',
};
