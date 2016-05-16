/* @flow weak */

/**
 * OfflineMobile Android getItemStockTotal function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

 /**
  * item: Realm.object
  */
export default function getItemQuantity(item) {
  let total = 0;

  item.lines.forEach((line) => {
    total += line.totalQuantity;
  });

  return total;
}
