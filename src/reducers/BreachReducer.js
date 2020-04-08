/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { UIDatabase } from '../database';

import { BREACH_ACTIONS } from '../actions/BreachActions';

const initialState = () => ({
  isModalOpen: false,
  forBatch: false,
  forFridge: false,
  forItem: false,
  batch: null,
  fridge: null,
  breaches: null,
});

export const BreachReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case BREACH_ACTIONS.OPEN_MODAL: {
      return { ...state, isModalOpen: true };
    }

    case BREACH_ACTIONS.CLOSE_MODAL: {
      return initialState();
    }

    case BREACH_ACTIONS.SET_BATCH: {
      const { payload } = action;
      const { batch } = payload;

      return { ...state, batch, forBatch: true };
    }

    case BREACH_ACTIONS.SET_BATCH_BREACH: {
      const { payload } = action;
      const { batch } = payload;

      return { ...state, itemName: batch.itemName, batch, forBatch: true };
    }

    case BREACH_ACTIONS.SET_FRIDGE_BREACH: {
      const { payload } = action;
      const { breachId } = payload;

      const breach = UIDatabase.get('TemperatureBreach', breachId) ?? {};

      const { location: fridge } = breach;

      return { ...state, fridge, breaches: [breach], forFridge: true, isModalOpen: true };
    }

    case BREACH_ACTIONS.SET_TRANSACTION_ITEM: {
      const { payload } = action;
      const { breaches, transactionItem } = payload;
      const { itemName } = transactionItem;

      return { ...state, breaches, itemName, forItem: true, isModalOpen: true };
    }

    case BREACH_ACTIONS.SET_STOCKTAKE_BATCH: {
      const { payload } = action;
      const { breaches, stocktakeBatch } = payload;
      const { itemName } = stocktakeBatch;

      return { ...state, breaches, itemName, forItem: true, isModalOpen: true };
    }

    default:
      return state;
  }
};
