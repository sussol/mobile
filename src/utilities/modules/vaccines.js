/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Utility and helper methods for the vaccine
 * module.
 */

const TEMPERATURE_RANGE = { minTemperature: 2, maxTemperature: 8 };
const MAX_BREACH_CHART_DATAPOINTS = 7;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const FRIDGE_CHART_LOOKBACK_MS = 30 * MILLISECONDS_IN_DAY;

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
export const sensorLogsExtractBatches = ({ sensorLogs = [], itemBatch, item } = {}) => {
  const groupedBatches = {};
  let filteredLogs;
  // If an Item has been passed, only find batches for this item.
  if (item) filteredLogs = sensorLogs.filtered('ItemBatches.item.id = $0', item.id);
  // If an ItemBatch has been passed, only find batches for this item.
  else if (itemBatch) filteredLogs = sensorLogs.filtered('ItemBatches.id = $0', itemBatch.id);
  filteredLogs.forEach(({ itemBatches, isInBreach }) => {
    // Premature exit if log has no batches, or is not a breached sensorLog
    if (itemBatches.length === 0 || !isInBreach) return;
    // For each batch, store it's details:
    // { duration, id, code, enteredDate, totalQuantity, expiryDate }
    // If already stored, skip.
    itemBatches.forEach(
      ({ id: batchId, code, enteredDate, totalQuantity, expiryDate, item: batchItem }) => {
        // Ensure each batch has stock and an associated Item.
        if (!(batchItem || totalQuantity > 0)) return;
        const { id: itemId } = batchItem;
        // If this batches item hasn't been encountered yet, create
        // a grouping object. groupedBatches = { itemId: { item, batches: {}  }}
        if (!groupedBatches[itemId]) groupedBatches[itemId] = { item: batchItem, batches: {} };
        // If this batch has been encountered before, skip it.
        const itemBatchGroup = groupedBatches[itemId].batches;
        if (itemBatchGroup[batchId]) return;
        // Calculate the duration this ItemBatch has been counted in this group of sensorLogs.
        const duration = new Date(
          filteredLogs.filtered('ItemBatches.id = $0', itemBatch.id).max('temperature') -
            filteredLogs.filtered('ItemBatches.id = $0', itemBatch.id).min('temperature')
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
      }
    );
  });
  // Create the return object. [ {item, batches: [ as above ] }, .. ]
  const allItemsForLogs = Object.values(groupedBatches).map(itemObject => {
    const { item: itemForGroup, batches } = itemObject;
    return {
      item: itemForGroup,
      batches: Object.values(batches).map(batchObject => batchObject),
    };
  });
  // Also return the sensorLogs for these items and batches.
  // If no items or batches have been found, items: [] is returned
  return {
    sensorLogs,
    items: allItemsForLogs,
  };
};

export const aggregateLogs = sensorLogs => [
  { timestamp: 'Feb 23', temperature: 5.9, sensorLog: sensorLogs[0] },
  { timestamp: 'Feb 24', temperature: 6, sensorLog: sensorLogs[0] },
  { timestamp: 'Feb 25', temperature: 7, sensorLog: sensorLogs[0] },
  { timestamp: 'Feb 26', temperature: 8.4, sensorLog: sensorLogs[0] },
  { timestamp: 'Feb 27', temperature: 8, sensorLog: sensorLogs[0] },
  { timestamp: 'March 1', temperature: 6, sensorLog: sensorLogs[0] },
  { timestamp: 'March 2', temperature: 5.7, sensorLog: sensorLogs[0] },
  { timestamp: 'March 3', temperature: 3.5, sensorLog: sensorLogs[0] },
  { timestamp: 'March 4', temperature: 3.8, sensorLog: sensorLogs[0] },
  { timestamp: 'March 5', temperature: 2.2, sensorLog: sensorLogs[0] },
];

export const extractBreachPoints = ({ lineData, fullBreaches, temperatureRange }) => [
  {
    timestamp: 'Feb 26',
    temperature: 8.4,
    sensorLogs: [],
    isMax: true, // sensorLogs.max('temperature') > temperatureRange.maxTemperature;
    ...temperatureRange,
  },
];

/**
 * Returns aggregated data for breach modal, based on passed array
 * of sensorLogs (breaches)
 */
export const extractDataForBreachModal = ({ breaches, itemFilter, itemBatchFilter }) => {
  const result = [];
  breaches.forEach(sensorLogs => {
    const { minTemperature, maxTemperature } = TEMPERATURE_RANGE;
    const maxPoints = MAX_BREACH_CHART_DATAPOINTS;
    const numberOfDataPoints = sensorLogs.length >= maxPoints ? maxPoints : sensorLogs.length;
    const isMax = sensorLogs.filtered('temperature >= $0', maxTemperature).length > 0;

    result.push({
      ...sensorLogsExtractBatches(sensorLogs, itemFilter, itemBatchFilter),
      chartData: {
        // TODO change based on aggregateLogs return format
        [isMax ? 'maxLine' : 'minLine']: aggregateLogs({
          sensorLogs,
          numberOfDataPoints,
          isMax,
        }),
        ...(isMax ? { maxTemperature } : { minTemperature }),
      },
    });
  });
};

/**
 * Returns aggregated data for breach modal, based on passed array
 * of sensorLogs (breaches)
 */
export const extractDataForFridgeChart = ({ database, fridge }) => {
  const sensorLogs = fridge.getSensorLogs(database, FRIDGE_CHART_LOOKBACK_MS);

  const chartRangeMilliseconds = sensorLogs.max('timestamp') - sensorLogs.min('timestamp');
  const numberOfDataPoints = Math.floor(chartRangeMilliseconds / MILLISECONDS_IN_DAY);

  // TODO change based on aggregateLogs return format
  const minLine = aggregateLogs(sensorLogs, numberOfDataPoints, true);
  const maxLine = aggregateLogs(sensorLogs, numberOfDataPoints, false);
  const fullBreaches = extractBreaches(sensorLogs);
  const breaches = [
    ...extractBreachPoints(minLine, fullBreaches, TEMPERATURE_RANGE),
    ...extractBreachPoints(maxLine, fullBreaches, TEMPERATURE_RANGE),
  ];

  return {
    minLine,
    maxLine,
    breaches,
    ...TEMPERATURE_RANGE,
  };
};
