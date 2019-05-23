/* eslint-disable prefer-destructuring */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import dateFormat from 'dateformat';
import { createRecord } from '../../database';
// eslint-disable-next-line import/no-extraneous-dependencies
/**
 * Utility and helper methods for the vaccine
 * module.
 */

const TEMPERATURE_RANGE = { minTemperature: 16, maxTemperature: 20 };
const MAX_BREACH_CHART_DATAPOINTS = 10;
const MAX_FRIDGE_CHART_DATAPOINTS = 30;
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const FRIDGE_CHART_LOOKBACK_MS = 30 * MILLISECONDS_IN_DAY;
const MILLISECONDS_IN_TWELVE_HOURS = MILLISECONDS_IN_DAY / 2;
const MILLISECONDS_IN_TWENTY_MINUTES = 1000 * 60 * 20;
const FRIDGE_CHART_TICK_FREQUENCY_BOUNDARY = MILLISECONDS_IN_TWELVE_HOURS * 3;

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
        breaches.push([...sensorLogStack]);
        sensorLogStack = [];
        sensorLogStack.push(sensorLog);
      }
    });
  });

  // Push any remaining sensorlogs. If any are left, they form a breach
  // with no delimiting non-breached sensorlog.
  const stackLength = sensorLogStack.length;
  if (sensorLogStack[stackLength - 1].isInBreach) breaches.push(sensorLogStack);

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
const extractBreachStatistics = (itemBatches, sensorLogs) => {
  const breachedLogs = sensorLogs.filtered('isInBreach = true');
  return {
    date: breachedLogs.min('timestamp') || null,
    location: sensorLogs[0].location,
    numberOfAffectedBatches: itemBatches.length,
    affectedQuantity: itemBatches.sum('numberOfPacks'),
    exposureRange: {
      minTemperature: breachedLogs.min('temperature') || Infinity,
      maxTemperature: breachedLogs.max('temperature') || -Infinity,
    },
    breachDuration: {
      startDate: breachedLogs.min('timestamp') || null,
      endDate: breachedLogs.max('timestamp') || null,
    },
  };
};

/**
 * Helper method for sensorLogExtractBreaches
 * @param {Realm.Results<SensorLog>} sensorLogs
 * @return {Object} example below
 * groupedBatches = { itemId: { item, batches: { id: { duration, id, code.. }, .. }}, .. }
 */
const extractItemBatches = ({ sensorLogs, itemBatch, item, database }) => {
  const groupedBatches = {};
  sensorLogs.forEach(sensorLog => {
    let itemBatches = database.objects('ItemBatch').filtered('sensorLogs.id = $0', sensorLog.id);
    if (item) itemBatches = itemBatches.filtered('item.id = $0', item.id);
    else if (itemBatch) itemBatches = itemBatches.filtered('id = $0', itemBatch.id);
    // Premature exit if log has no batches, or is not a breached sensorLog
    if (itemBatches.length === 0) return;
    // For each batch, store it's details:
    // { duration, id, code, enteredDate, totalQuantity, expiryDate }
    // If already stored, skip.
    itemBatches.forEach(
      ({ id: batchId, batch: code, enteredDate, totalQuantity, expiryDate, item: batchItem }) => {
        // Ensure each batch has stock and an associated Item.
        if (!(item || totalQuantity > 0) || !totalQuantity) return;
        const { id: itemId } = batchItem;
        // If this batches item hasn't been encountered yet, create
        // a grouping object. groupedBatches = { itemId: { item, batches: {}  }}
        if (!groupedBatches[itemId]) groupedBatches[itemId] = { item: batchItem, batches: {} };
        // If this batch has been encountered before, skip it.
        const itemBatchGroup = groupedBatches[itemId].batches;
        if (itemBatchGroup[batchId]) return;

        // Calculate the duration this ItemBatch has been counted in this group of sensorLogs.
        const sensorLogsForThisBatch = sensorLogs
          .filtered('itemBatches.id = $0', batchId)
          .sorted('timestamp');
        const duration = {
          startDate: sensorLogsForThisBatch[0].timestamp,
          endDate: sensorLogsForThisBatch[sensorLogsForThisBatch.length - 1].timestamp,
        };

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
  // Ensure that when passed a breach, we disregard the delimiter sensorLogs
  // which aren't breaches when calculating statistics.
  let filteredLogs = sensorLogs.filtered('isInBreach = $0', true).sorted('timestamp');
  // If an Item has been passed, only find batches for this item.
  if (item) filteredLogs = sensorLogs.filtered('itemBatches.item.id = $0', item.id);
  // If an ItemBatch has been passed, only find batches for this item.
  else if (itemBatch) filteredLogs = sensorLogs.filtered('itemBatches.id = $0', itemBatch.id);
  const groupedBatches = extractItemBatches({
    sensorLogs: filteredLogs,
    itemBatch,
    item,
    database,
  });
  // Create the return object. [ {item, batches: [ as above ] }, .. ]
  const allItemsForLogs = Object.values(groupedBatches).map(itemObject => {
    if (item && itemObject.item.id !== item.id) return null;
    const { item: itemForGroup, batches } = itemObject;
    return {
      item: itemForGroup,
      batches: Object.values(batches).map(batchObject => batchObject),
    };
  });
  // Get all ItemBatch objects associated with these sensorLogs, used in
  // calculating statistics of this breach

  const allItemBatches = database
    .objects('ItemBatch')
    .filtered(filteredLogs.map(({ id }) => `sensorLogs.id = "${id}"`).join(' OR '));
  // Also return the sensorLogs for these items and batches.
  // If no items or batches have been found, items: [] is returned
  return {
    id: sensorLogs.map(({ id }) => id).join(),
    sensorLogs,
    items: allItemsForLogs,
    ...extractBreachStatistics(allItemBatches, sensorLogs),
  };
};

const formatChartDate = (date, shouldDisplayMonth, shouldDisplayDay) => {
  let result = `${dateFormat(date, 'h:MM')}\n`;
  if (shouldDisplayMonth) result += `${dateFormat(date, 'mmm')} `;
  if (shouldDisplayDay) result += `${dateFormat(date, 'd')}`;
  return result;
};
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

/**
 * Aggregates sensor logs into groups of logs by dates.
 *
 * @param   {Realm.results}  sensorLogs          A collection of sensorLog objects to aggregate.
 * @param   {number}         numberOfDataPoints  Number of aggregated data points to return.
 * @param   {Date}           startDate           Start date of temperature range to aggregate
 *                                               over.
 * @param   {Date}           endDate             End date of temperature range to aggregate over.
 * @return  {Object[]}                           Aggregated sensor logs, array of objects in form
 *                                              [{timestamp}, {temperature},...].
 */
export const aggregateLogs = ({
  sensorLogs,
  numberOfDataPoints,
  startDate = null,
  endDate = null,
  includeBothEnds = false,
}) => {
  if (!(sensorLogs.length > 0)) return [];

  // Generate interval boundaries.

  const startTimestamp = sensorLogs.min('timestamp');
  const endTimestamp = sensorLogs.max('timestamp');

  const startBoundary = new Date(Math.min(startTimestamp, startDate) || startTimestamp);
  const endBoundary = new Date(Math.max(endTimestamp, endDate) || endTimestamp);

  // Caclulate interval duration in ms.
  const totalDuration = endBoundary - startBoundary;
  const intervalDuration = totalDuration / numberOfDataPoints;

  const aggregatedLogs = [];
  for (let i = 0; i < numberOfDataPoints; i += 1) {
    const intervalStartDate = new Date(startBoundary.getTime() + intervalDuration * i);

    // Do not offset last end date to prevent not including last log.
    const endDateOffset = i !== numberOfDataPoints - 1 ? 1 : 0;
    const intervalEndDate = new Date(
      startBoundary.getTime() + intervalDuration * (i + 1) - endDateOffset
    );

    aggregatedLogs.push({ intervalStartDate, intervalEndDate });
  }

  const maxLine = [];
  const minLine = [];

  // Map intervals to aggregated objects.
  const medianDuration = intervalDuration / 2;
  let currentMonth = null;
  let currentDay = null;
  aggregatedLogs.forEach(aggregateLog => {
    const { intervalStartDate, intervalEndDate } = aggregateLog;

    // Group sensor logs by interval.
    const intervalLogs = sensorLogs.filtered(
      'timestamp >= $0 && timestamp <= $1',
      intervalStartDate,
      intervalEndDate
    );

    const timeStampUnformated = new Date(intervalStartDate.getTime() + medianDuration);
    const thisLogsMonth = timeStampUnformated.getMonth();
    const thisLogsDay = timeStampUnformated.getDay();
    const shouldDisplayMonth = thisLogsMonth !== currentMonth;
    const shouldDisplayDays = thisLogsDay !== currentDay;

    const timestamp = formatChartDate(timeStampUnformated, shouldDisplayMonth, shouldDisplayDays);

    currentMonth = thisLogsMonth;
    currentDay = thisLogsDay;

    if (intervalLogs.length === 0) {
      maxLine.push({ temperature: null, timestamp });
      minLine.push({ temperature: null, timestamp });
      return;
    }

    let maxSensorLog = intervalLogs.sorted('temperature', true)[0];
    let minSensorLog = intervalLogs.sorted('temperature', false)[0];

    if (includeBothEnds) {
      let shouldUseLast = null;
      if (intervalStartDate <= startTimestamp && startTimestamp <= intervalEndDate) {
        shouldUseLast = false;
      }
      if (intervalStartDate <= endTimestamp && endTimestamp <= intervalEndDate) {
        shouldUseLast = true;
      }
      if (shouldUseLast !== null) {
        maxSensorLog = intervalLogs.sorted('timestamp', shouldUseLast)[0];
        minSensorLog = maxSensorLog;
      }
    }

    maxLine.push({ temperature: maxSensorLog.temperature, timestamp, sensorLog: maxSensorLog });
    minLine.push({ temperature: minSensorLog.temperature, timestamp, sensorLog: minSensorLog });
  });

  return { maxLine, minLine };
};

export const extractBreachPoints = (lineData, fullBreaches, { maxTemperature }) => {
  if (fullBreaches.length === 0) return [];
  const result = [];

  fullBreaches.forEach(breach => {
    if (breach.length === 0) return;
    const isMax = breach.max('temperature') > maxTemperature;
    const { id: idToMatch } = breach.sorted('temperature', isMax)[0];
    const matchedDataPoint = lineData.find(dataPoint => {
      if (!dataPoint.sensorLog) return false;
      return dataPoint.sensorLog.id === idToMatch;
    });

    if (!matchedDataPoint) return;

    result.push({
      ...matchedDataPoint,
      sensorLogs: breach,
    });
  });
  return result;
};

/**
 * Returns aggregated data for breach modal, based on passed array
 * of sensorLogs (breaches)
 */
export const extractDataForBreachModal = ({
  breaches,
  itemFilter,
  itemBatchFilter,
  database,
  includeBothEnds = false,
}) => {
  const result = [];
  breaches.forEach(sensorLogs => {
    const { minTemperature, maxTemperature } = TEMPERATURE_RANGE;
    const maxPoints = MAX_BREACH_CHART_DATAPOINTS;
    const numberOfDataPoints = sensorLogs.length >= maxPoints ? maxPoints : sensorLogs.length;
    const isMax = sensorLogs.max('temperature') > maxTemperature;
    const lineKey = isMax ? 'maxLine' : 'minLine';
    result.push({
      ...sensorLogsExtractBatches({
        sensorLogs,
        item: itemFilter,
        itemBatch: itemBatchFilter,
        database,
      }),
      chartData: {
        // TODO change based on aggregateLogs return format
        [lineKey]: aggregateLogs({
          sensorLogs,
          numberOfDataPoints,
          isMax,
          includeBothEnds,
        })[lineKey],
        ...(isMax ? { maxTemperature } : { minTemperature }),
      },
    });
  });
  return result;
};

/**
 * Returns chart props for fridge chart.
 *
 * Collects the last 30 days of sensor logs for a given fridge.
 * aggregates these logs into periods. Will use a number of periods
 * in [ 0, 30 ] - attempting to use 9 hour periods. If there are less
 * sensorLogs than 9 hour periods, we just use the sensorlogs length.
 *
 * @param {Realm}        database App wide database
 * @param {Realm.Fridge} fridge   Provided fridge object to find chart data for.
 */
export const extractDataForFridgeChart = ({ database, fridge }) => {
  // Fetch the last 30 days of sensorlogs which have some aggregation status.
  const sensorLogs = fridge.getSensorLogs(database, FRIDGE_CHART_LOOKBACK_MS);
  // Find the domain for all sensor logs.
  const sensorLogsDuration = sensorLogs.max('timestamp') - sensorLogs.min('timestamp');
  // Determine if we are using 20 minute intervals, 12 hours or a constant 30 data points.
  const isLessThanTickBoundary = sensorLogsDuration < FRIDGE_CHART_TICK_FREQUENCY_BOUNDARY;
  const chartIntervals = isLessThanTickBoundary
    ? MILLISECONDS_IN_TWENTY_MINUTES
    : MILLISECONDS_IN_TWELVE_HOURS;
  const numberOfDataPoints = Math.min(
    Math.floor(sensorLogsDuration / chartIntervals),
    MAX_FRIDGE_CHART_DATAPOINTS
  );
  // Aggregate the sensorlogs into the number of intervals provided.
  const lines = aggregateLogs({ sensorLogs, numberOfDataPoints, endDate: new Date() });
  // Find each breach point within the sensorlogs.
  const fullBreaches = extractBreaches({ sensorLogs, database });
  // Extract the exact data points on the chart for each breach.
  const breaches = [
    ...extractBreachPoints(lines.minLine, fullBreaches, TEMPERATURE_RANGE),
    ...extractBreachPoints(lines.maxLine, fullBreaches, TEMPERATURE_RANGE),
  ];
  return {
    ...lines,
    breaches,
    ...TEMPERATURE_RANGE,
  };
};

export function vaccineDisposalAdjustments({
  database,
  record: supplierInvoice,
  user,
  itemBatches,
}) {
  let batchesToDispose;
  // If ItemBatches were passed, making InventoryAdjustments for
  // ItemBatches, rather than for TransactionBatches from a SupplierInvoice
  if (itemBatches) {
    // Any ItemBatch which has an Option, has been set as disposed or has
    // a vvmStatus of failed.
    // Create objects similar to a TransactionBatch for each ItemBatch
    // a part of the InventoryAdjustment.
    batchesToDispose = itemBatches
      .filter(itemBatch => !!itemBatch.option)
      .map(itemBatch => ({
        itemBatch: itemBatch.parentBatch ? itemBatch.parentBatch : itemBatch,
        numberOfPacks: itemBatch.totalQuantity,
        option: itemBatch.option,
        location: itemBatch.location,
      }));
  } else if (supplierInvoice) {
    // When a SupplierInvoice is passed, InventoryAdjustments are made for
    // each VVM Failed TransactionBatch a part of that invoice.
    batchesToDispose = supplierInvoice
      .getTransactionBatches(database)
      .filtered('isVVMPassed = false');
  } else {
    // If neither of the above are passed, prematurely exit.
    return;
  }
  // If there are no batches which should be disposed, prematurely exit.
  if (batchesToDispose.length === 0) return;

  let date = new Date();
  if (supplierInvoice) date = supplierInvoice.confirmDate;
  const isAddition = false;
  // Create an InventoryAdjustment transaction for removing
  // stock.
  database.write(() => {
    const inventoryAdjustment = createRecord(
      database,
      'InventoryAdjustment',
      user,
      date,
      isAddition,
      { status: 'new' }
    );
    // Create the TransactionItem and TransactionBatch for each batch to dispose
    batchesToDispose.forEach(({ itemBatch: batch, numberOfPacks, option, location }) => {
      // Defensively skip this batch if it has no itemBatch, option or the numberOfPacks
      // isn't positive
      if (!(batch || numberOfPacks > 0 || option)) return;

      let itemBatch = batch;
      if (!batch.addTransactionBatch) {
        const id = (batch.parentBatch && batch.parentBatch.id) || batch.id;
        itemBatch = database.objects('ItemBatch').filtered('id = $0', id)[0];
      }
      // Skip this batch if the ItemBatch has no related Item.
      const { item } = itemBatch;
      if (!item) return;

      const transactionItem = createRecord(database, 'TransactionItem', inventoryAdjustment, item);
      createRecord(database, 'TransactionBatch', transactionItem, itemBatch, {
        numberOfPacks,
        isVVMPassed: false,
        option,
        location,
      });
    });
    // Finalise the transaction to make real database changes.
    inventoryAdjustment.finalise(database);
  });
}
