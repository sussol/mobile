import { Database } from 'react-native-database';

import { schema } from './schema';

const BaseDatabaseInstance = new Database(schema);

export default BaseDatabaseInstance;
