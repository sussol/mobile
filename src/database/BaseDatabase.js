/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Interface to a Realm, to be wrapped by
 * SyncDatabase or UIDatabase.
 *
 * Only one instance will be active at any point
 * in the applications life-cycle.
 */

import { Database } from 'react-native-database';

import { schema } from './schema';

const BaseDatabaseInstance = new Database(schema);

export default BaseDatabaseInstance;
