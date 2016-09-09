import Realm from 'realm';

export class Name extends Realm.Object {

  get numberOfTransactions() {
    return this.transactions.length;
  }

  addMasterListIfUnique(masterList) {
    if (this.masterLists.filtered('id == $0', masterList.id).length > 0) return;
    this.masterLists.push(masterList);
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
  }

  addTransactionIfUnique(transaction) {
    if (this.transactions.filtered('id == $0', transaction.id).length > 0) return;
    this.addTransaction(transaction);
  }

  toString() {
    return this.name;
  }
}

Name.schema = {
  name: 'Name',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'placeholderName' },
    code: { type: 'string', default: 'placeholderCode' },
    phoneNumber: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: { type: 'string', default: 'placeholderType' },
    isCustomer: { type: 'bool', default: false },
    isSupplier: { type: 'bool', default: false },
    isManufacturer: { type: 'bool', default: false },
    masterLists: { type: 'list', objectType: 'MasterList' },
    transactions: { type: 'list', objectType: 'Transaction' },
    isVisible: { type: 'bool', default: false },
    supplyingStoreId: { type: 'string', optional: true },
  },
};
