import Realm from 'realm';
import { generateUUID } from '../utilities';

export class Transaction extends Realm.Object {
  get isFinalised() {
    return this.status === 'finalised';
  }

  addLine(database, transactionLine) {
    let transactionItem = null;
    this.items.forEach((item) => {
      if (item.item.id === transactionLine.itemId) transactionItem = item;
    });
    if (!transactionItem) { // This transaction doesn't have a matching item yet, make one
      transactionItem = database.create('TransactionItem', {
        id: generateUUID(),
        item: transactionLine.itemLine.item,
        transaction: this,
      });
    }
    transactionItem.lines.push(transactionLine);
    this.items.push(transactionItem);
  }

  finalise(database, user) {
    this.status = 'finalised';
    if (this.type === 'supplier_invoice') { // If a supplier invoice, add item lines to inventory
      this.enteredBy = user;
      this.items.forEach((transactionItem) => {
        transactionItem.lines.forEach((transactionLine) => {
          const itemLine = transactionLine.itemLine;
          itemLine.packSize = transactionLine.packSize;
          itemLine.numberOfPacks = transactionLine.numberOfPacks;
          itemLine.expiryDate = transactionLine.expiryDate;
          itemLine.batch = transactionLine.batch;
          itemLine.costPrice = transactionLine.costPrice;
          itemLine.sellPrice = transactionLine.sellPrice;
          database.save('ItemLine', itemLine);
          database.save('TransactionLine', transactionLine);
        });
      });
    }
  }
}
