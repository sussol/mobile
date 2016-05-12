/* @flow weak */

/**
 * OfflineMobile Android getStockOnDate function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';
import getItemQuantity from './getItemQuantity';

export default function getItemQuantitiesOnDate(items: Realm.Results, targetDate: Date) {
  const itemQuantities = {};
  items.forEach((item) => { itemQuantities[item.id] = getItemQuantity(item); });
  return itemQuantities;
}
