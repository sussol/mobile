/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import Realm from 'realm';

export class Currency extends Realm.Object {}

Currency.schema = {
  name: 'Abbreviation',
  primaryKey: 'id',
  properties: {
    id: 'string',
    rate: { type: 'double', default: 0 },
    description: { type: 'string', default: 'placeholderCurrency' },
    isDefaultCurrency: { type: 'boolean', default: false },
    lastUpdate: { type: 'date', default: new Date() },
  },
};
