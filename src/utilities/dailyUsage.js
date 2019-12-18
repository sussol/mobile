/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { UIDatabase } from '../database';
import { MILLISECONDS_PER_DAY, millisecondsToDays } from '../database/utilities/index';

const DEFAULT_LOOKBACK_PERIOD = 90;
/**
 * Returns either a customized lookback period, or 90 days in milliseconds.
 */
const getAMCLookbackPeriod = () => {
  const amcLookbackString = UIDatabase.getSetting('monthlyConsumptionLookBackPeriod');
  return (
    (amcLookbackString ? Number(amcLookbackString) : DEFAULT_LOOKBACK_PERIOD) * MILLISECONDS_PER_DAY
  );
};

/**
 * Returns if this store is customized such that usage should force a lookback period,
 * rather than using an items added date.
 */
const getAMCEnforcementLookback = () => {
  const amcEnforcementString = UIDatabase.getSetting('monthlyConsumptionEnforceLookBackPeriod');
  return amcEnforcementString === 'true';
};

/**
 * Calculates usage for a provided item.
 * Default behaviour is to calculate all usage (total quantity of all customer invoice
 * transaction batches) over the last 90 days, and divide by tbe minimum of 90 days or
 * the number of days the item has been in stock.
 * Customized behaviour is to enforce only using the lookback period, rather than when
 * the item was added. Each store can also have it's lookback period customized.
 * @param {Item} item
 */
export const dailyUsage = item => {
  const { batches, addedDate, id: itemId } = item;

  if (!batches.length) return 0;

  const amcLookback = getAMCLookbackPeriod();
  const amcEnforceLookback = getAMCEnforcementLookback();

  const dateNow = new Date();
  const lookbackDate = new Date(dateNow - amcLookback);
  const addedRecently = addedDate > lookbackDate;

  const startDate = amcEnforceLookback || !addedRecently ? lookbackDate : addedDate;

  const usagePeriod = dateNow - startDate;
  const numberOfUsageDays = millisecondsToDays(usagePeriod);

  const usage = UIDatabase.objects('TransactionBatch')
    .filtered('itemBatch.item.id == $0', itemId)
    .filtered('transaction.type == $0', 'customer_invoice')
    .filtered('transaction.confirmDate >= $0 && transaction.confirmDate <= $1', startDate, dateNow)
    .reduce((sum, { totalQuantity }) => sum + totalQuantity, 0);

  return usage / numberOfUsageDays || 1;
};
