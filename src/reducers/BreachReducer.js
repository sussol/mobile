/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { BREACH_ACTIONS } from '../actions/BreachActions';

const initialState = () => ({
  isModalOpen: false,
  forFridge: false,
  forItem: false,
  batch: null,
  fridge: null,
  breaches: null,
});

export const BreachReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case BREACH_ACTIONS.CLOSE_MODAL: {
      return initialState();
    }

    case BREACH_ACTIONS.VIEW_ITEM_BREACHES: {
      const { payload } = action;
      const { breaches, itemName } = payload;

      return { ...state, breaches, itemName, forItem: true, isModalOpen: true };
    }

    case BREACH_ACTIONS.VIEW_FRIDGE_BREACHES: {
      const { payload } = action;
      const { breaches, fridgeName } = payload;

      return { ...state, breaches, fridgeName, forFridge: true, isModalOpen: true };
    }

    default:
      return state;
  }
};
