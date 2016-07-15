import Realm from 'realm';

export class NumberToReuse extends Realm.Object {

  get sequenceKey() {
    return this.numberSequence ? this.numberSequence.sequenceKey : '';
  }

  toString() {
    return `${this.number} available for reuse in sequence ${this.sequenceKey}`;
  }
}
