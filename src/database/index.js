/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Database from './BaseDatabase';
import { getUIDatabaseInstance } from './UIDatabase';

export { CHANGE_TYPES, generateUUID } from 'react-native-database';

export { createRecord, getNumberSequence, NUMBER_SEQUENCE_KEYS } from './utilities';
export { getUIDatabaseInstance };

export const UIDatabase = getUIDatabaseInstance(Database);
