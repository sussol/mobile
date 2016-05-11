/* @flow weak */

/**
 * OfflineMobile Android getStockOnDate function
 * Sustainable Solutions (NZ) Ltd. 2016
 */

import Realm from 'realm';

export default function getStockOnDate(targetDate: Date, items: Realm.Results) {
  return items.snapshot();
}
