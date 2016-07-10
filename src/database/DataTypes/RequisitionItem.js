import Realm from 'realm';

export class RequisitionItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }
  get suggestedQuantity() {
    return this.requisition ? this.dailyUsage * this.requisition.daysToSupply : 0;
  }
}
