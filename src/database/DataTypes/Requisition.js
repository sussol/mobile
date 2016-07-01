import Realm from 'realm';
import { addLineToParent, generateUUID } from '../utilities';

export class Requisition extends Realm.Object {
  get isFinalised() {
    return this.status === 'finalised';
  }

  // Adds a RequisitionLine, incorporating it into a matching RequisitionItem
  addLine(database, requisitionLine) {
    addLineToParent(requisitionLine, this, () =>
      database.create('TransactionItem', {
        id: generateUUID(),
        item: requisitionLine.itemLine.item,
        requisition: this,
      }));
  }

  finalise() {
    this.status = 'finalised';
    // TODO behaviour when requisition is finalised
  }
}
