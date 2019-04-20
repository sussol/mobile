/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Utility and helper methods for the vaccine
 * module.
 */

/**
 * Extracts breaches from a set of sensor logs.
 * Breach: Sequential sensorLog objects whose temperature is outside
 * the lower or uppound limits, form a breach. Each array returned
 * contains all sensorLogs which form a breach INCLUDING the sensorLog
 * prior to the breach, and after the breach, if they exist. There may
 * be duplicate non-breach sensorLogs as breach delimiters if there is
 * only one sensorLog between breaches.
 *
 * Method sorts the sensorLogs by timestamp, iterates and pushes onto a
 * stack. Only one unBreached sensorLog is kept at the tail of the stack.
 * All breached sensorLogs are pushed, until a non breached log, where this
 * marks a breach has been found. Store these sensorLogs and reset the stack.
 *
 * @param  {Realm.results} sensorLogs array of sensorLog objects
 * @return {Array<Realm.results<SensorLog>} A 2D array of Realm.results. Example:
 * [ [ sensorLog1, sensorLog2 .. ], [ sensorLog1, sensorLog2, sensorLog3, .. ]]
 * where each element is a Realm.results<SensorLog>
 */
export const extractBreaches = ({ sensorLogs = [], database }) => {
  if (!(database && sensorLogs.length > 0)) return [];

  let sensorLogStack = [];
  const breaches = [];
  const sensorLogsByLocation = {};

  sensorLogs.forEach(({ location }) => {
    // If no location or it's is is falsey, ignore it.
    // to avoid a 'null' grouping.
    if (!(location && location.id)) return;
    // If this lcoation has been seen, ignore it.
    if (sensorLogsByLocation[location.id]) return;
    // Create a grouping of sensorlogs for this locations
    sensorLogsByLocation[location.id] = sensorLogs
      .filtered('location.id = $0', location.id)
      .sorted('timestamp');
  });

  Object.values(sensorLogsByLocation).forEach(logsForLocation => {
    logsForLocation.forEach(sensorLog => {
      const { isInBreach } = sensorLog;
      const { length: stackLength } = sensorLogStack;
      // If the stack is empty, just push this sensorLog.
      if (stackLength === 0) sensorLogStack.push(sensorLog);
      // Any breached sensorLogs are always pushed onto the stack.
      else if (isInBreach) sensorLogStack.push(sensorLog);
      // If both head of the stack and this sensorLog are unbreached,
      // replace the head. This can occurs when the length is 1. Two
      // sequential unbreached logs are never pushed.
      else if (!sensorLogStack[stackLength - 1].isInBreach && !isInBreach) {
        sensorLogStack.pop();
        sensorLogStack.push(sensorLog);
        // In all other cases, a breach has been found. Push the last sensorlog,
        // store the breach and reset the stack. Push this sensorLog back
        // onto the stack as the new potential delimiter for the next breach.
      } else {
        sensorLogStack.push(sensorLog);
        breaches.push([sensorLogStack]);
        sensorLogStack = [];
        sensorLogStack.push(sensorLog);
      }
    });
  });

  // Push any remaining sensorlogs. If any are left, they form a breach
  // with no delimiting non-breached sensorlog.
  if (sensorLogStack.length > 0) breaches.push(sensorLogStack);

  // Create Realm.result objects for each breach.
  return breaches.map(breach =>
    database.objects('SensorLog').filtered(breach.map(({ id }) => `id = "${id}"`).join(' OR '))
  );
};

/**
 * Helper method for sensorLogExtractBreaches. Extracts
 * statistics for a set of sensorlogs and itembatches.
 * @param {Realm.results<ItemBatch>} itemBatches
 * @param {Realm.results<SensorLog>} sensorLogs
 */
const extractBreachStatistics = (itemBatches, sensorLogs) => ({
  location: sensorLogs.location,
  numberOfAffectedBatches: itemBatches.length,
  affectedQuantity: itemBatches.sum('numberOfPacks'),
  exposureRange: {
    minTemperature: itemBatches.min('temperature') || Infinity,
    maxTemperature: itemBatches.max('temperautre') || -Infinity,
  },
  breachDuration: {
    startDate: itemBatches.max('timestamp') || null,
    endDate: itemBatches.min('timestamp') || null,
  },
});

/**
 * Helper method for sensorLogExtractBreaches
 * @param {Realm.Results<SensorLog>} sensorLogs
 * @return {Object} example below
 * groupedBatches = { itemId: { item, batches: { id: { duration, id, code.. }, .. }}, .. }
 */
const extractItemBatches = sensorLogs => {
  const groupedBatches = {};
  sensorLogs.forEach(({ itemBatches, isInBreach }) => {
    // Premature exit if log has no batches, or is not a breached sensorLog
    if (itemBatches.length === 0 || !isInBreach) return;
    // For each batch, store it's details:
    // { duration, id, code, enteredDate, totalQuantity, expiryDate }
    // If already stored, skip.
    itemBatches.forEach(({ id: batchId, code, enteredDate, totalQuantity, expiryDate, item }) => {
      // Ensure each batch has stock and an associated Item.
      if (!(item || totalQuantity > 0)) return;
      const { id: itemId } = item;
      // If this batches item hasn't been encountered yet, create
      // a grouping object. groupedBatches = { itemId: { item, batches: {}  }}
      if (!groupedBatches[itemId]) groupedBatches[itemId] = { item, batches: {} };
      // If this batch has been encountered before, skip it.
      const itemBatchGroup = groupedBatches[itemId].batches;
      if (itemBatchGroup[batchId]) return;
      // Calculate the duration this ItemBatch has been counted in this group of sensorLogs.
      const duration = new Date(
        sensorLogs.filtered('ItemBatches.id = $0', batchId).max('temperature') -
          sensorLogs.filtered('ItemBatches.id = $0', batchId).min('temperature')
      );
      // Finally store the batches details:
      // groupedBatches = { itemId: { item, batches: { id: { duration, id, code.. }, .. }}, .. }
      itemBatchGroup[batchId] = {
        duration,
        id: batchId,
        code,
        enteredDate,
        totalQuantity,
        expiryDate,
      };
    });
  });
  return groupedBatches;
};

/**
 * Extracts all ItemBatches which are related to the passed sensorLogs.
 * Groups all ItemBatch objects by Item and calculates the duration of
 * time each ItemBatch was present during these logs.
 *
 * Option parameters itemBatch and item are used to filter the ItemBatches
 * for these sensorLogs to only search for ItemBatch records which are
 * related to the Item xor the ItemBatch. Item takes priority over
 * ItemBatch if both are passed.
 *
 * Method iterates through each batch, grouping batches by Item. Will store
 * values on the first encounter of a batch, otherwise will just increment
 * the duration.
 *
 * @param  {Realm.results/array} sensorLogs
 * @param  {ItemBatch}           itemBatch
 * @param  {Item}                item
 * @return {Array<Object>} array of objects, see example below.
 * [
 *  {
 *     item,
 *     batches: [ { id, code, expiryDate, enteredDate, duration, totalQuantity }]
 *  }
 *  ...
 * ]
 */
export const sensorLogsExtractBatches = ({ sensorLogs = [], itemBatch, item, database } = {}) => {
  let filteredLogs = sensorLogs;
  // If an Item has been passed, only find batches for this item.
  if (item) filteredLogs = sensorLogs.filtered('ItemBatches.item.id = $0', item.id);
  // If an ItemBatch has been passed, only find batches for this item.
  else if (itemBatch) filteredLogs = sensorLogs.filtered('ItemBatches.id = $0', itemBatch.id);
  const groupedBatches = extractItemBatches(filteredLogs);
  // Create the return object. [ {item, batches: [ as above ] }, .. ]
  const allItemsForLogs = Object.values(groupedBatches).map(itemObject => {
    const { item: itemForGroup, batches } = itemObject;
    return {
      item: itemForGroup,
      batches: Object.values(batches).map(batchObject => batchObject),
    };
  });
  // Get all ItemBatch objects associated with these sensorLogs, used in
  // calculating statistics of this breach.
  const allItemBatches = database
    .objects('ItemBatch')
    .filtered(sensorLogs.map(({ id }) => `sensorLogs.id = "${id}"`).join(' OR '));
  // Also return the sensorLogs for these items and batches.
  // If no items or batches have been found, items: [] is returned
  return {
    sensorLogs,
    items: allItemsForLogs,
    ...extractBreachStatistics(allItemBatches, sensorLogs),
  };
};
