import Realm from 'realm';

export class RequisitionItem extends Realm.Object {
  get itemId() {
    return this.item ? this.item.id : '';
  }

  get itemCode() {
    return this.item ? this.item.code : '';
  }

  get itemName() {
    return this.item ? this.item.name : '';
  }

  get requisitionId() {
    return this.requisition ? this.requisition.id : '';
  }

  get monthlyUsage() {
    return this.dailyUsage * 30;
  }

  get suggestedQuantity() {
    return this.requisition ? this.dailyUsage * this.requisition.daysToSupply : 0;
  }
}
