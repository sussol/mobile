/* @flow weak */

/**
 * OfflineMobile Android getStockOnDate function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import database from '../database/realm';
import getItemQuantity from './getItemQuantity';

// items: Realm.Results, date: Date
export default function getItemQuantitiesOnDate(items, date) {
  const itemQuantities = new Map();
  items.forEach((item) => {
    itemQuantities.set(item.id, getItemQuantity(item));
  });

  const transactions = database.objects('Transaction').filtered('confirmDate >= $0', date);

  transactions.forEach((transaction) => {
    let transactionTypeMultiplier;
    switch (transaction.type) {
      case 'customer_invoice':
      case 'supplier_credit':
        transactionTypeMultiplier = 1;
        break;
      case 'customer_credit':
      case 'supplier_invoice':
        transactionTypeMultiplier = -1;
        break;
      default:
        return;
    }

    transaction.lines.forEach((line) => {
      const itemId = line.itemId;
      const transactionQuantity = line.totalQuantity;
      if (itemQuantities.has(itemId)) {
        itemQuantities.set(
          itemId,
          itemQuantities.get(itemId) + transactionQuantity * transactionTypeMultiplier
        );
      }
    });
  });

  return itemQuantities;
}
