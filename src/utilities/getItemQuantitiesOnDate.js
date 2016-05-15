/* @flow weak */

/**
 * OfflineMobile Android getStockOnDate function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';
import database from '../database/realm';
import { getItemQuantity } from './index';

export default function getItemQuantitiesOnDate(items: Realm.Results, date: Date) {
  const itemQuantities = new Map();
  items.forEach((item) => {
    itemQuantities.set(item.id, getItemQuantity(item));
  });

  const transactions = database.objects('Transaction').filtered('confirmDate >= $0', date);

  transactions.forEach((transaction) => {
    const transactionType = transaction.type;
    transaction.lines.forEach((line) => {
      const itemId = line.itemId;
      const transactionQuantity = line.totalQuantity;
      if (itemQuantities.has(itemId)) {
        switch (transactionType) {
          case 'customer_invoice':
          case 'supplier_credit':
            itemQuantities.set(itemId, itemQuantities.get(itemId) + transactionQuantity);
            break;
          case 'customer_credit':
          case 'supplier_invoice':
            itemQuantities.set(itemId, itemQuantities.get(itemId) - transactionQuantity);
            break;
          default:
        }
      }
    });
  });

  return itemQuantities;
}
