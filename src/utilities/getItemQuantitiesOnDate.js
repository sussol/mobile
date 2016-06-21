/* @flow weak */

/**
 * OfflineMobile Android
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import { getItemQuantity } from './getItemQuantity';

 /**
 * Get the total quantity of provided items on a specifed date. Returns empty map if
 * provided Realm.results object is empty.
 * @param  {Realm.results}   items          The items to get the past totalQuantity of.
 * @param  {Date}            date           The date of which to roll back transactions to.
 * @param  {Realm}           database       The realm database that the function is to work on,
 *                                          The same database the items are from.
 * @return {Map([item.id: totalQuantity])}
 */
export function getItemQuantitiesOnDate(items, date, database) {
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
        return; // effectively 'continue;' for the containing forEach loop.
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
