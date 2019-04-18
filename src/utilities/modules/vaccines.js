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

  const sensorLogStack = [];
  const breaches = [];
  const sensorLogsByLocation = {};

  // Sort the sensor logs by timestamp.
  sensorLogs.sorted('timestamp', true);

  // Group all sensorLogs by location
  sensorLogs.forEach(sensorLog => {
    const { location } = sensorLog;
    // If this sensorLog doesn't have a location,
    // ignore it
    if (!location) return;
    if (!sensorLogsByLocation[location.id]) sensorLogsByLocation[location.id] = [sensorLog];
    else sensorLogsByLocation[location.id].push(sensorLog);
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
        breaches.push([...sensorLogStack]);
        sensorLogStack.length = 0;
        sensorLogStack.push(sensorLog);
      }
    });
  });

  // Push any remaining sensorlogs. If any are left, they form a breach
  // with no delimiting non-breached sensorlog.
  if (sensorLogStack.length > 0) breaches.push(sensorLogStack);

  // Create Realm.result objects for each breach.
  return breaches.map(breach => {
    const sensorIds = breach.map(log => log.id);
    const queryString = sensorIds.map((_, i) => `id = $${i}`).join(' OR ');
    return database.objects('SensorLog').filtered(queryString, ...sensorIds);
  });
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
 *     itemId,
 *     itemName,
 *     batches: [ { id, code, expiryDate, enteredDate, duration, totalQuantity }]
 *  }
 *  ...
 * ]
 */
export const sensorLogsExtractBatches = ({ sensorLogs = [], itemBatch, item } = {}) => {
  const groupedBatches = {};
  sensorLogs.forEach(({ itemBatches, interval }) => {
    // Premature exit if log has no batches.
    if (itemBatches.length === 0) return;

    let batchesToUse = [...itemBatches];
    // If an Item has been passed, only find batches for this item.
    if (item) batchesToUse = batchesToUse.filter(batch => batch.item && batch.item.id === item.id);
    // If an ItemBatch has been passed, only find batches for this item.
    else if (itemBatch) batchesToUse = batchesToUse.filter(({ id }) => id === itemBatch.id);
    // For each batch, store it's details. If already stored, increment the
    // duration in the breach by this logs interval.
    batchesToUse.forEach(
      ({ item: batchItem, id: batchId, code, enteredDate, expiryDate, totalQuantity }) => {
        // Premature return if this ItemBatch does not have an Item associated
        if (!batchItem) return;
        const { id: itemId, name: itemName } = batchItem;
        // If this batches item hasn't been encountered yet, create
        // a grouping object.
        if (!groupedBatches[itemId]) groupedBatches[itemId] = { itemId, itemName, batches: {} };
        const itemBatchesGrouping = groupedBatches[itemId].batches;
        // If this batch has been encountered before, just increment
        // it's duration by the interval of this log.
        if (itemBatchesGrouping[batchId]) {
          itemBatchesGrouping[batchId].duration += interval;
          // If it has not been encountered yet, store the details
          // for this batch
        } else {
          itemBatchesGrouping[batchId] = {
            duration: interval,
            id: batchId,
            code,
            enteredDate,
            totalQuantity,
            expiryDate,
          };
        }
      }
    );
  });

  // Create the return object
  return Object.values(groupedBatches).map(itemObject => {
    const { itemId, itemName, batches } = itemObject;
    return {
      itemId,
      itemName,
      batches: Object.values(batches).map(batchObject => batchObject),
    };
  });
};
