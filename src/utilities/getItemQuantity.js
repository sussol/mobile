/* @flow weak */

/**
 * OfflineMobile Android getItemStockTotal function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';

export default function getItemQuantity(item: Realm.Object) {
  let total = 0;

  item.lines.forEach((line) => {
    total += line.totalQuantity;
  });

  return total;
}
