/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import Realm from 'realm';

import { createRecord } from '../utilities';

/**
 * Primarily used for serial numbers, this class keeps track of a sequence of numbers,
 * providing functionality to get the next number in the sequence, and to readd previously
 * used numbers for reuse.
 */
export class NumberSequence extends Realm.Object {
  destructor(database) {
    database.delete('NumberToReuse', this.numbersToReuse);
  }

  /**
   * Get the next number that can be used in this sequence, preferring reused numbers.
   *
   * @return  {integer}  Next number in sequence.
   */
  getNextNumber(database) {
    if (this.numbersToReuse.length > 0) {
      // There is at least one number we can reuse.
      const numberToReuse = this.numbersToReuse.sorted('number')[0];
      const { number } = numberToReuse;
      database.delete('NumberToReuse', numberToReuse);
      return number;
    }
    this.highestNumberUsed += 1;
    return this.highestNumberUsed; // Increment the highest number used and return the result.
  }

  /**
   * Set a number to be reused.
   *
   * @param   {Realm}    database  App database.
   * @param   {integer}  number    The number to reuse.
   */
  reuseNumber(database, number) {
    createRecord(database, 'NumberToReuse', this, number);
  }

  /**
   * Add a number to this number sequence to be reused.
   *
   * @param   {Realm}    database  App database.
   * @param   {integer}  number    The number to reuse.
   */
  addNumberToReuse(numberToReuse) {
    if (numberToReuse.number > this.highestNumberUsed) {
      throw new Error(`Cannot reuse ${numberToReuse.number} as it has not been used yet`);
    }
    if (
      this.numbersToReuse.find(
        testNumberToReuse => testNumberToReuse.number === numberToReuse.number
      )
    ) {
      throw new Error(`Sequence ${this.sequenceKey} already reusing ${numberToReuse.number}`);
    }
    this.numbersToReuse.push(numberToReuse);
  }

  toString() {
    return `Highest in sequence ${this.sequenceKey} is ${this.highestNumberUsed}`;
  }
}

export default NumberSequence;

// NumberSequence uses 'sequenceKey' as primary key, to ensure it is always unique,
// and to allow id to be edited after it has been created (i.e. on incoming sync).
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
