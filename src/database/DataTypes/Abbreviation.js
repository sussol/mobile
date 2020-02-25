/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';

export class Abbreviation extends Realm.Object {}

Abbreviation.schema = {
  name: 'Abbreviation',
  primaryKey: 'id',
  properties: {
    id: 'string',
    abbreviation: 'string',
    expansion: 'string',
  },
};
