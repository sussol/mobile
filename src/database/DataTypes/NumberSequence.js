/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { createRecord } from '../utilities';

/**
 * A class to maintain sequence of numbers, providing functionality to get the next number in a
 * sequence, and to readd previously used numbers for reuse. Primarily used for serial numbers.
 *
 * @property  {string}               id
 * @property  {sequenceKey}          string              Primary key. Ensures uniqueness, and
 *                                                       enables editing after creation (i.e
 *                                                       on incoming sync).
 * @property  {number}                highestNumberUsed
 * @property  {List.<NumberToReuse>}  numbersToReuse
 */
export class NumberSequence extends Realm.Object {
  destructor(database) {
    database.delete('NumberToReuse', this.numbersToReuse);
  }

  /**
   * Get the next number that can be used in this sequence, preferring reused numbers.
   *
   * @return  {number}
   */
  getNextNumber(database) {
    // Get lowest number to reuse. Number is removed from database before being returned.
    if (this.numbersToReuse.length > 0) {
      const numberToReuse = this.numbersToReuse.sorted('number')[0];
      const { number } = numberToReuse;
      database.delete('NumberToReuse', numberToReuse);
      return number;
    }

    // If no numbers to reuse, increment the highest number used and return it as the next number.
    this.highestNumberUsed += 1;
    return this.highestNumberUsed;
  }

  /**
   * Set a number to be reused.
   *
   * @param  {Realm}   database
   * @param  {number}  number
   */
  reuseNumber(database, number) {
    createRecord(database, 'NumberToReuse', this, number);
  }

  /**
   * Add a number to be reused by this number sequence.
   *
   * @param   {Realm}   database
   * @param   {number}  number
   */
  addNumberToReuse(numberToReuse) {
    if (
      this.numbersToReuse.find(
        testNumberToReuse => testNumberToReuse.number === numberToReuse.number
      )
    ) {
      throw new Error(`Sequence ${this.sequenceKey} already reusing ${numberToReuse.number}`);
    }
    this.numbersToReuse.push(numberToReuse);
  }

  /**
   * Get string representation of number sequence.
   */
  toString() {
    return `Highest in sequence ${this.sequenceKey} is ${this.highestNumberUsed}`;
  }
}

NumberSequence.schema = {
  name: 'NumberSequence',
  primaryKey: 'sequenceKey',
  properties: {
    id: { type: 'string', default: 'placeholderId' },
    sequenceKey: 'string',
    highestNumberUsed: { type: 'int', default: 0 },
    numbersToReuse: { type: 'list', objectType: 'NumberToReuse' },
  },
};

export default NumberSequence;
