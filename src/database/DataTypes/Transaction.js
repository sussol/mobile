import Realm from 'realm';

export class Transaction extends Realm.Object {
  get isFinalised() {
    return this.status === 'finalised';
  }

  finalise(database, user) {
    this.status = 'finalised';
    if (this.type === 'supplier_invoice') { // If a supplier invoice, add item lines to inventory
      this.enteredBy = user;
      this.lines.forEach((transactionLine) => {
        const itemLine = transactionLine.itemLine;
        itemLine.packSize = transactionLine.packSize;
        itemLine.numberOfPacks = transactionLine.numberOfPacks;
        itemLine.expiryDate = transactionLine.expiryDate;
        itemLine.batch = transactionLine.batch;
        itemLine.costPrice = transactionLine.costPrice;
        itemLine.sellPrice = transactionLine.sellPrice;
        database.save('ItemLine', itemLine);
      });
    }
  }
}
