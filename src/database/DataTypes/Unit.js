/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * TODO
 */
export class Unit extends Realm.Object {}

Unit.schema = {
  name: 'Unit',
  primaryKey: 'id',
  properties: {
    id: 'string',
    units: { type: 'string', default: 'Each' },
    comment: { type: 'string', optional: true },
    orderNumber: { type: 'double', default: 0 },
  },
};

export default Unit;
