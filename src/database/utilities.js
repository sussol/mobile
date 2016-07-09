import uuid from 'react-native-uuid';

// Generate and return a universally unique ID based on RFC4122 v1
export function generateUUID() {
  return uuid.v1().replace(/-/g, ''); // Strip canonical uuid of hyphens
}

// Return the sum of the given key across the given records
export function getTotal(records, key) {
  return records.reduce((sum, record) => sum + record[key], 0);
}

export function addBatchToParent(batch, parent, createItem) {
  let item = parent.items.find(aggItem => aggItem.itemId === batch.itemId);
  if (!item) { // This parent doesn't have a matching item yet, make one
    item = createItem();
    parent.items.push(item);
  }
  // If the batch is already in the item, we don't want to add it again
  if (item.batches.find(currentBatch => currentBatch.id === batch.id)) return;
  item.batches.push(batch);
}
