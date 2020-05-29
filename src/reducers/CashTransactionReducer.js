/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { CASH_TRANSACTION_ACTION_TYPES } from '../actions';
import {
  CASH_TRANSACTION_TYPES,
  CASH_TRANSACTION_INPUT_MODAL_FIELDS,
} from '../utilities/modules/dispensary/constants';

const initialState = () => ({
  name: null,
  type: CASH_TRANSACTION_TYPES.CASH_IN,
  amount: null,
  paymentType: null,
  reason: null,
  description: null,
  inputModal: { field: CASH_TRANSACTION_INPUT_MODAL_FIELDS.NAME, isOpen: false },
});

export const CashTransactionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case CASH_TRANSACTION_ACTION_TYPES.UPDATE_NAME: {
      const { payload } = action;
      const { name } = payload;
      return { ...state, name };
    }

    case CASH_TRANSACTION_ACTION_TYPES.TOGGLE_TYPE: {
      const { type: currentType } = state;
      if (currentType === CASH_TRANSACTION_TYPES.CASH_IN) {
        return { ...state, type: CASH_TRANSACTION_TYPES.CASH_OUT };
      }
      if (currentType === CASH_TRANSACTION_TYPES.CASH_OUT) {
        return { ...state, type: CASH_TRANSACTION_TYPES.CASH_IN };
      }
      return { ...state, type: initialState.type };
    }

    case CASH_TRANSACTION_ACTION_TYPES.UPDATE_AMOUNT: {
      const { payload } = action;
      const { amount } = payload;
      return { ...state, amount };
    }

    case CASH_TRANSACTION_ACTION_TYPES.UPDATE_PAYMENT_TYPE: {
      const { payload } = action;
      const { paymentType } = payload;
      return { ...state, paymentType };
    }

    case CASH_TRANSACTION_ACTION_TYPES.UPDATE_REASON: {
      const { payload } = action;
      const { reason } = payload;
      return { ...state, reason };
    }

    case CASH_TRANSACTION_ACTION_TYPES.UPDATE_DESCRIPTION: {
      const { payload } = action;
      const { description } = payload;
      return { ...state, description };
    }

    case CASH_TRANSACTION_ACTION_TYPES.OPEN_INPUT_MODAL: {
      const { payload } = action;
      const { modalField } = payload;
      const inputModal = { field: modalField, isOpen: true };
      return { ...state, inputModal };
    }

    case CASH_TRANSACTION_ACTION_TYPES.CLOSE_INPUT_MODAL: {
      const { inputModal } = state;
      return { ...state, inputModal: { ...inputModal, isOpen: false } };
    }

    default:
      return state;
  }
};
