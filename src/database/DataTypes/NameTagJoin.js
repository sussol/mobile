/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class NameTagJoin extends Realm.Object {}

NameTagJoin.schema = {
  name: 'NameTagJoin',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'Name', optional: true },
    nameTag: { type: 'NameTag', optional: true },
  },
};

export default NameTagJoin;
