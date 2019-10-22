/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { MILLISECONDS_PER_DAY } from './constants';

// Return the sum of the given key across the given records.
export const getTotal = (records, key) => records.reduce((sum, record) => sum + record[key], 0);

/**
 * Adds a batch to its parent, checking first if there is an existing item to add
 * it to, and otherwise calling the creator passed in. Works for anything with a
 * parent -> item -> batch hierarchy, e.g. transactions and stocktakes.
 *
 * @param {object}    batch       The batch to add.
 * @param {object}    parent      The parent to add the batch to.
 * @param {function}  createItem  A function to create new items to add to the hierarchy.
 */
export const addBatchToParent = (batch, parent, createItem) => {
  let item = parent.items.find(aggItem => aggItem.itemId === batch.itemId);

  // This parent doesn't have a matching item yet, make one.
  // Should also take care of attaching item to its parent.
  if (!item) {
    item = createItem();
  }

  // If the batch is already in the item, we don't want to add it again.
  if (item.batches && item.batches.find(currentBatch => currentBatch.id === batch.id)) return;

  item.addBatch(batch);
};

// Round up to the nearest day.
export const millisecondsToDays = milliseconds => Math.ceil(milliseconds / MILLISECONDS_PER_DAY);
