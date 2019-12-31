/* eslint-disable no-unused-expressions */
/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { batch } from 'react-redux';
import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';
import { createRecord } from '../database/utilities';
import { PrescriberActions } from '../actions/PrescriberActions';
import { WizardActions } from '../actions/WizardActions';

const initialState = () => ({
  currentTab: 0,
  transaction: null,
});

const ACTIONS = {
  SWITCH_TAB: 'Prescription/SWITCH_TAB',
  SELECT_ITEM: 'Prescription/SELECT_ITEM',
  REMOVE_ITEM: 'Prescription/REMOVE_ITEM',
  UPDATE_DIRECTION: 'Prescription/UPDATE_DIRECTION',
};

export const updateDirection = (id, newValue) => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id)[0];
  item?.setItemDirection(UIDatabase, newValue);

  dispatch({ type: ACTIONS.REMOVE_ITEM });
};

export const removeItem = id => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const item = items.filtered('id == $0', id);

  UIDatabase.write(() => {
    UIDatabase.delete('TransactionItem', item);
  });

  dispatch({ type: ACTIONS.REMOVE_ITEM });
};

export const editQuantity = (id, quantity) => (_, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const { items } = transaction;

  const itemToUpdate = items.filtered('id == $0', id)[0];

  UIDatabase.write(() => {
    itemToUpdate.setTotalQuantity(UIDatabase, quantity);
    UIDatabase.save('TransactionItem', itemToUpdate);
  });
};

export const switchTab = nextTab => ({
  type: ACTIONS.SWITCH_TAB,
  payload: { nextTab },
});

export const selectPrescriber = prescriberID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const prescriber = UIDatabase.get('Prescriber', prescriberID);

  UIDatabase.write(() =>
    UIDatabase.update('Transaction', {
      ...transaction,
      prescriber,
    })
  );

  batch(() => {
    dispatch(PrescriberActions.setPrescriber(prescriber));
    dispatch(WizardActions.nextTab());
  });
};

export const selectItem = itemID => (dispatch, getState) => {
  const { prescription } = getState();
  const { transaction } = prescription;
  const item = UIDatabase.get('Item', itemID);

  if (!transaction.hasItem(item)) {
    UIDatabase.write(() => {
      createRecord(UIDatabase, 'TransactionItem', transaction, item, 1);
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
    case ACTIONS.REMOVE_ITEM: {
      const { transaction } = state;
      const { id } = transaction;
      return { ...state, transaction: UIDatabase.get('Transaction', id) };
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
