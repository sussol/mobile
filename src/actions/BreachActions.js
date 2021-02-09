/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { BreachManagerSingleton } from '../bluetooth/BreachManager';
import { UIDatabase } from '../database';

export const BREACH_ACTIONS = {
  CLOSE_MODAL: 'breachActions/closeModal',
  CREATE_CONSECUTIVE_SUCCESS: 'breachActions/createConsecutiveSuccess',
  CREATE_CONSECUTIVE_FAIL: 'breachActions/createConsecutiveFail',
  VIEW_FRIDGE_BREACHES: 'breachActions/viewFridgeBreaches',
  VIEW_ITEM_BREACHES: 'breachActions/viewItemBreaches,',
};

const close = () => ({ type: BREACH_ACTIONS.CLOSE_MODAL });
const createConsecutiveFail = () => ({ type: BREACH_ACTIONS.CREATE_CONSECUTIVE_FAIL });

const createConsecutiveSuccess = (sensor, updatedBreaches, updatedLogs) => ({
  type: BREACH_ACTIONS.CREATE_CONSECUTIVE_SUCCESS,
  payload: { sensor, updatedBreaches, updatedLogs },
});

const createConsecutiveBreaches = sensor => async dispatch => {
  const { id } = sensor;

  try {
    const logs = await BreachManagerSingleton().getLogsToCheck(id);
    const configs = sensor.breachConfigs;
    const mostRecentBreach = await BreachManagerSingleton().getMostRecentBreach(id);
    const [breaches, temperatureLogs] = await BreachManagerSingleton().createBreaches(
      sensor,
      logs,
      configs,
      mostRecentBreach
    );
    const [updatedBreaches, updatedLogs] = await BreachManagerSingleton().updateBreaches(
      breaches,
      temperatureLogs
    );
    dispatch(createConsecutiveSuccess(sensor, updatedBreaches, updatedLogs));
  } catch (error) {
    dispatch(createConsecutiveFail);
  }

  return null;
};

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
  createConsecutiveBreaches,
  close,
  viewFridgeBreach,
  viewStocktakeBatchBreaches,
  viewTransactionItemBreaches,
};
