import Realm from 'realm';
import { createRecord } from '../utilities';

/**
 * Primarily used for serial numbers, this class keeps track of a sequence of numbers,
 * providing functionality to get the next number in the sequence, and to add previously
 * used numbers back for reuse
 */
export class NumberSequence extends Realm.Object {

  destructor(database) {
    database.delete('NumberToReuse', this.numbersToReuse);
  }

  /**
   * Returns the next number that can be used in this sequence, preferring reused numbers
   * @return {integer} Next number in sequence
   */
  getNextNumber(database) {
    if (this.numbersToReuse.length > 0) { // There is at least one number we can reuse
      const numberToReuse = this.numbersToReuse.sorted('number')[0];
      const number = numberToReuse.number;
      database.delete('NumberToReuse', numberToReuse);
      return number;
    }
    return ++this.highestNumberUsed; // Increment the highest number used and return the result
  }

  /**
   * Simply tells this sequence it should reuse the given number
   * @param  {Realm}   database App wide local database
   * @param  {integer} number   The number to reuse
   * @return {none}
   */
  reuseNumber(database, number) {
    createRecord(database, 'NumberToReuse', this, number);
  }

  /**
   * Adds the given number into this number sequence to be reused.
   * @param  {Realm}   database   App wide local database
   * @param  {integer} number     The number to reuse
   * @return {none}
   */
  addNumberToReuse(numberToReuse) {
    if (numberToReuse.number > this.highestNumberUsed) {
      throw new Error(`Cannot reuse ${numberToReuse.number} as it has not been used yet`);
    }
    if (this.numbersToReuse.find((testNumberToReuse) =>
                                  testNumberToReuse.number === numberToReuse.number)) {
      throw new Error(`Sequence ${this.sequenceKey} already reusing ${numberToReuse.number}`);
    }
    this.numbersToReuse.push(numberToReuse);
  }

  toString() {
    return `Highest in sequence ${this.sequenceKey} is ${this.highestNumberUsed}`;
  }
}


// Number sequence has sequenceKey as primary key, to a) ensure it is always unique,
// and b) allow us to change the id after it is created (i.e. on incoming sync)
NumberSequence.schema = {
  name: 'NumberSequence',
  primaryKey: 'sequenceKey',
  properties: {
    id: 'string',
    sequenceKey: 'string',
    highestNumberUsed: { type: 'int', default: 0 },
    numbersToReuse: { type: 'list', objectType: 'NumberToReuse' },
  },
};
