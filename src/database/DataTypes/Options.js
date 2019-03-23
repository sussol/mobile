/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class Options extends Realm.Object {}

export default Options;

Options.schema = {
  name: 'Options',
  primaryKey: 'id',
  properties: {
    id: 'string',
    title: { type: 'string', default: 'Placeholder Name' },
    type: { type: 'string', default: 'Placeholder Type' },
    isActive: { type: 'bool', default: false },
  },
};
