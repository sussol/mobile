/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

/**
 * A reusable number associated with a NumberSequence.
 *
 * @property  {string}          id
 * @property  {NumberSequence}  numberSequence
 * @property  {number}          number
 */
export class NumberToReuse extends Realm.Object {
  /**
   * Get key of number sequence associated with this number.
   *
   * @return  {string}
   */
  get sequenceKey() {
    return this.numberSequence ? this.numberSequence.sequenceKey : '';
  }

  /**
   * Get string representation of number to reuse.
   *
   * @return  {string}
   */
  toString() {
    return `${this.number} available for reuse in sequence ${this.sequenceKey}`;
  }
}

NumberToReuse.schema = {
  name: 'NumberToReuse',
  primaryKey: 'id',
  properties: {
    id: 'string',
    numberSequence: 'NumberSequence',
    number: 'int',
  },
};

export default NumberToReuse;
