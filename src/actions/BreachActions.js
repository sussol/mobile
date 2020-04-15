/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { UIDatabase } from '../database';

export const BREACH_ACTIONS = {
  CLOSE_MODAL: 'breachActions/closeModal',
  VIEW_FRIDGE_BREACHES: 'breachActions/viewFridgeBreaches',
  VIEW_ITEM_BREACHES: 'breachActions/viewItemBreaches,',
};

const close = () => ({ type: BREACH_ACTIONS.CLOSE_MODAL });

const viewStocktakeBatchBreaches = stocktakeBatchId => {
  const stocktakeBatch = UIDatabase.get('StocktakeBatch', stocktakeBatchId);
  const { breaches, itemName } = stocktakeBatch ?? {};

  return { type: BREACH_ACTIONS.VIEW_ITEM_BREACHES, payload: { breaches, itemName } };
};

const viewTransactionItemBreaches = transactionItemId => {
  const transactionItem = UIDatabase.get('TransactionItem', transactionItemId);
  const { breaches, itemName } = transactionItem ?? {};

  return { type: BREACH_ACTIONS.VIEW_ITEM_BREACHES, payload: { breaches, itemName } };
};

const viewFridgeBreach = breachId => {
  const breaches = UIDatabase.objects('TemperatureBreach').filtered('id == $0', breachId);
  const fridgeName = (breaches.length && breaches[0]?.location?.description) ?? '';

  return { type: BREACH_ACTIONS.VIEW_FRIDGE_BREACHES, payload: { breaches, fridgeName } };
};

export const BreachActions = {
  close,
  viewFridgeBreach,
  viewStocktakeBatchBreaches,
  viewTransactionItemBreaches,
};
