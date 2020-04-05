/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { BREACH_ACTIONS } from '../actions/BreachActions';

const initialState = () => ({
  isModalOpen: false,
  forBatch: false,
  forFridge: false,
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
      return { ...state, isModalOpen: false, forBatch: false, forFridge: false };
    }

    case BREACH_ACTIONS.SET_BATCH: {
      const { payload } = action;
      const { batch } = payload;

      return { ...state, batch, forBatch: true };
    }

    case BREACH_ACTIONS.SET_BATCH_BREACH: {
      const { payload } = action;
      const { batch } = payload;

      return { ...state, batch, forBatch: true };
    }

    case BREACH_ACTIONS.SET_FRIDGE_BREACH: {
      const { payload } = action;
      const { fridge, breach } = payload;

      return { ...state, breach, fridge, forFridge: true };
    }

    default:
      return state;
  }
};
