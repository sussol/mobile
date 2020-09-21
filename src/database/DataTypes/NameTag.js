/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class NameTag extends Realm.Object {}

NameTag.schema = {
  name: 'NameTag',
  primaryKey: 'id',
  properties: {
    id: 'string',
    description: { type: 'string', default: 'Placeholder description' },
    nameTagJoins: { type: 'linkingObjects', objectType: 'NameTagJoin', property: 'nameTag' },
  },
};

export default NameTag;
