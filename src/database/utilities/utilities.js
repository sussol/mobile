/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { MILLISECONDS_PER_DAY } from './index';

// Return the sum of the given key across the given records.
export function getTotal(records, key) {
  return records.reduce((sum, record) => {
    return sum + record[key];
  }, 0);
}

/**
 * Adds a batch to its parent, checking first if there is an existing item to add
 * it to, and otherwise calling the creator passed in. Works for anything with a
 * parent -> item -> batch hierarchy, e.g. transactions and stocktakes.
 *
 * @param {object}    batch       The batch to add.
 * @param {object}    parent      The parent to add the batch to.
 * @param {function}  createItem  A function to create new items to add to the hierarchy.
 */
export function addBatchToParent(batch, parent, createItem) {
  let item = parent.items.find(aggItem => {
    return aggItem.itemId === batch.itemId;
  });
  if (!item) {
    // This parent doesn't have a matching item yet, make one.
    item = createItem(); // Should also take care of attaching item to its parent.
  }
  // If the batch is already in the item, we don't want to add it again.
  if (
    item.batches &&
    item.batches.find(currentBatch => {
      return currentBatch.id === batch.id;
    })
  ) {
    return;
  }
  item.addBatch(batch);
}

export function millisecondsToDays(milliseconds) {
  return Math.ceil(milliseconds / MILLISECONDS_PER_DAY); // Round up to the nearest day.
}
