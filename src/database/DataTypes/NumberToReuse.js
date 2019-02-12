/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

export class NumberToReuse extends Realm.Object {
  get sequenceKey() {
    return this.numberSequence ? this.numberSequence.sequenceKey : '';
  }

  toString() {
    return `${this.number} available for reuse in sequence ${this.sequenceKey}`;
  }
}

export default NumberToReuse;

NumberToReuse.schema = {
  name: 'NumberToReuse',
  primaryKey: 'id',
  properties: {
    id: 'string',
    numberSequence: 'NumberSequence',
    number: 'int',
  },
};
