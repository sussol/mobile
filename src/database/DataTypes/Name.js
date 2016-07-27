import Realm from 'realm';

export class Name extends Realm.Object {

  addTransaction(transaction) {
    // If the transaction is already in this name, we don't want to add it again
    if (this.transactions.find(currentTransaction => currentTransaction.id === transaction.id)) {
      return;
    }
    this.transactions.push(transaction);
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
    name: 'string',
    code: 'string',
    phoneNumber: { type: 'string', optional: true },
    billingAddress: { type: 'Address', optional: true },
    emailAddress: { type: 'string', optional: true },
    type: 'string',
    isCustomer: 'bool',
    isSupplier: 'bool',
    isManufacturer: 'bool',
    masterList: { type: 'MasterList', optional: true },
    transactions: { type: 'list', objectType: 'Transaction' },
    isVisible: { type: 'bool', default: false },
    supplyingStoreId: { type: 'string', optional: true },
  },
};
