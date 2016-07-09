import Realm from 'realm';

export class Requisition extends Realm.Object {
  get isFinalised() {
    return this.status === 'finalised';
  }

  // Adds a RequisitionItem to this Requisition
  addItem(database, requisitionItem) {
    this.items.push(requisitionItem);
  }

  finalise() {
    this.status = 'finalised';
    // TODO behaviour when requisition is finalised
  }
}
