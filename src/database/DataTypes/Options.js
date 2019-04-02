/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';
/**
 * An Options object is a simple explanation of why a change or
 * value was used in a situation. Used for stock takes, to
 * provide a reason for having a stock take batch quantity differ
 * from the stock take batch snapshot quantity. Types used in
 * mSupply are stocktakeLineAdjustment, cashOutTransaction,
 * requisitionLineVariance. Only stocktakeLineAdjustment
 * types are accepted on incoming sync.
 * @property  {string}  id
 * @property  {string}  title     A generic name field
 * @property  {string}  type      The type of option
 * @property  {boolean} isActive  If the option is currently available to use
 */
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
