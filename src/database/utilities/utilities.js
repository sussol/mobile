// Return the sum of the given key across the given records
export function getTotal(records, key) {
  return records.reduce((sum, record) => sum + record[key], 0);
}

/**
 * Adds a batch to its parent, checking first if there is an existing item to add
 * it to, and otherwise calling the creator passed in. Works for anything with a
 * parent -> item -> batch hierarchy, e.g. Transactions and Stocktakes
 * @param {object}   batch      The batch to add
 * @param {object}   parent     The parent to add the batch to
 * @param {function} createItem A function to create new items to add to the hierarchy
 */
export function addBatchToParent(batch, parent, createItem) {
  let item = parent.items.find(aggItem => aggItem.itemId === batch.itemId);
  if (!item) { // This parent doesn't have a matching item yet, make one
    item = createItem(); // Should also take care of attaching item to its parent
  }
  // If the batch is already in the item, we don't want to add it again
  if (item.batches && item.batches.find(currentBatch => currentBatch.id === batch.id)) return;
  item.addBatch(batch);
}
/**
 * Removes TransactionBatch...
 * 1 - Remove ItemBatch from TransactionBatch
 * 2 - Remove TransactionBatch from TransactionItem
 * 3 - if TransactionItem has no batches, remove TransactionItem from Transaction
 * @param {Realm}   database   App wide database
 * @param {Transaction}   transaction  context transaction
 * @param {TransactionBatch} transactionBatch transaction batch to remove
 */
export function removeTransactionBatchUtil(database, transaction, transactionBatch) {
  // Find transaction item
  const transactionItem =
            transaction.items.find(item => item.checkTransactionBatch(transactionBatch));
    // Remove transactionBatch and it's ItemBatch
  transactionBatch.removeItemBatch(database);
    // RemoveTransactionBatch return true if transactionItem still has
    // TransactionBatches
  if (transactionItem.removeTransactionBatch(database, transactionBatch)) {
    database.save('TransactionItem', transactionItem);
  } else {
    transaction.removeTransactionItem(database, transactionItem);
    database.save('Transaction', transaction);
  }
}
/**
 * Returns class as JSON, warning: since the schema has child <-> parent (circular))
 * printing via console.log or json Stringify will be infinite..
 * use util.format('[Circular]', returnJson) to log
 * @param {class}   class instance
 * @return {json}   class instance fields key value pairs in json
  */
export function classAsJson(classInstance) {
  const returnJson = {};
  Object.keys(classInstance).forEach(key => {
    if (typeof classInstance[key] !== 'function') {
      returnJson[key] = classInstance[key];
    }
  });
  return returnJson;
}
