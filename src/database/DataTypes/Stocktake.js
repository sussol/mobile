import Realm from 'realm';

export class Stocktake extends Realm.Object {
  get isFinalised() {
    return this.status === 'finalised';
  }

  finalise() {
    this.status = 'finalised';
  }
}
