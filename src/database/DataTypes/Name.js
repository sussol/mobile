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
