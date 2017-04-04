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
 * function to return all transactionbatches for transaction
 * used in ExternalSupplierInvoicePage.getFilteredSortedData
 * @param {Array<TransactionItem>} items  item from which to extraxt transaction batches
 * @return {Array<TransactionBatch}
 */
export function getAllTransactionBatches(items) {
  const rTransactionBatches = [];
  items.forEach((item) => {
    item.batches.forEach((tBatch) => rTransactionBatches.push(tBatch));
  });
  return rTransactionBatches;
}
/**
 * build query string for Realm.objects.filtered(@return)
 * @param {Array<RealmElement>} idCollection from which to extract ids
 * @return {String} format : id = "id1" OR id = "id2" etc...
 */
export function buildFilterIDString(idCollection) {
  let retString = '';
  idCollection.forEach((item) => {
    retString = `${retString} OR id = "${item.id}"`;
  });

  return retString.slice(4);
}
/**
 * Removes TransactionBatch...
 * 1 - Remove ItemBatch from TransactionBatch
 * 2 - Remove TransactionBatch from TransactionItem
 * 3 - if TransactionItem has no batches, remoe TransactionItem from Transaction
 * @param {Realm}   database   App wide database
 * @param {Transaction}   transaction  context transaction
 * @param {TransactionBatch} transactionBatch transaction batch to remove
 */
export function removeTransactionBatchUtil(database, transaction, transactionBatch) {
  // find transaction item
  const transactionItem =
            transaction.items.find(testI => testI.checkTransactionBatch(transactionBatch));
    // remove transactionBatch and it's ItemBatch
  transactionBatch.removeItemBatch(database);
    // removeTransactionBatch return true if transactionItem still has
    // transactionBatches
  if (transactionItem.removeTransactionBatch(database, transactionBatch)) {
    database.save('TransactionItem', transactionItem);
  } else {
    transaction.removeTransactionItem(database, transactionItem);
    database.save('Transaction', transaction);
  }
}
/**
 * function is a hack to check class type, use for debugin only
 * @param {Object} classInstance to check
 * @return {String} class name
 */
export function getClassType(classInstance) {
  if (classInstance === undefined) return 'cannot get class of undefined';
  let retStr = classInstance.constructor.toString(); // returns function className() {blah; blah;}
  retStr = retStr.substring(9);    // strip 'function' and '(){blah;...' a bit of a hack
  return retStr.substring(0, retStr.indexOf('('));
}
