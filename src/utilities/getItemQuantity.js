/* @flow weak */

/**
 * OfflineMobile Android getItemStockTotal function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

 /**
 * Get the total quantity of provided provided Item, calculated from its ItemLines.
 * @param  {Realm.object}  item  The item to get the total quantity of.
 * @return {number}
 */
export default function getItemQuantity(item) {
  let total = 0;

  item.lines.forEach((line) => {
    total += line.totalQuantity;
  });

  return total;
}
