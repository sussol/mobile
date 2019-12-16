/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';
import { createRecord } from '../database/utilities/index';

const initialState = () => ({
  currentTab: 0,
  transaction: null,
});

const ACTIONS = {
  SWITCH_TAB: 'PRESCRIPTION/SWITCH_TAB',
  SELECT_ITEM: 'PRESCRIPTION/SELECT_ITEM',
};

export const switchTab = nextTab => ({
  type: ACTIONS.SWITCH_TAB,
  payload: { nextTab },
});

export const selectPrescriber = prescriberID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction, currentTab } = prescription;
  const prescriber = UIDatabase.get('Prescriber', prescriberID);

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...transaction,
      prescriber,
    })
  );

  dispatch(switchTab(currentTab + 1));
};

export const selectItem = itemID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const item = UIDatabase.get('Item', itemID);

  if (!transaction.hasItem(item)) {
    UIDatabase.write(() => {
      createRecord(UIDatabase, 'TransactionItem', transaction, item);
    });
  }

  dispatch({ type: ACTIONS.SELECT_ITEM });
};

export const PrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;

      return { ...state, transaction };
    }

    case ACTIONS.SWITCH_TAB: {
      const { payload } = action;
      const { nextTab } = payload;
      return { ...state, currentTab: nextTab };
    }

    case ACTIONS.SELECT_ITEM: {
      const { transaction } = state;
      const { id } = transaction;

      // Force a new reference to the prescription object to force a re-render.
      return { ...state, transaction: UIDatabase.get('Transaction', id) };
    }

    default:
      return state;
  }
};
