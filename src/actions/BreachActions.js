/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { UIDatabase } from '../database';

export const BREACH_ACTIONS = {
  OPEN_MODAL: 'breachActions/openModal',
  CLOSE_MODAL: 'breachActions/closeModal',
  SET_FRIDGE_BREACH: 'breachActions/setFridgeBreach',
  SET_BATCH_BREACH: 'breachActions/setBatchBreach',
  SET_BATCH: 'breachActions/setBatch',
  SET_TRANSACTION_ITEM: 'breachActions/setTransactionItem',
  SET_STOCKTAKE_BATCH: 'breachActions/setStocktakeBatch',
};

const open = () => ({ type: BREACH_ACTIONS.OPEN_MODAL });
const close = () => ({ type: BREACH_ACTIONS.CLOSE_MODAL });

const setTransactionItem = transactionItemId => {
  const transactionItem = UIDatabase.get('TransactionItem', transactionItemId);
  const { breaches } = transactionItem;

  return { type: BREACH_ACTIONS.SET_TRANSACTION_ITEM, payload: { breaches, transactionItem } };
};

const setStocktakeBatch = stocktakeBatchId => {
  const stocktakeBatch = UIDatabase.get('StocktakeBatch', stocktakeBatchId);
  const { breaches } = stocktakeBatch ?? {};

  return { type: BREACH_ACTIONS.SET_STOCKTAKE_BATCH, payload: { breaches, stocktakeBatch } };
};

const setFridgeBreach = breachId => ({
  type: BREACH_ACTIONS.SET_FRIDGE_BREACH,
  payload: { breachId },
});

const setBatchBreach = (batch, breach) => ({
  type: BREACH_ACTIONS.SET_BATCH_BREACH,
  payload: { batch, breach },
});

const setBatch = batch => ({
  type: BREACH_ACTIONS.SET_BATCH,
  payload: { batch },
});

export const BreachActions = {
  open,
  close,
  setFridgeBreach,
  setBatchBreach,
  setBatch,
  setTransactionItem,
  setStocktakeBatch,
};
