/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import currency from 'currency.js';

import { ROUTES } from '../navigation';
import { PAYMENT_ACTIONS } from '../actions/PaymentActions';
import { WIZARD_ACTIONS } from '../actions/WizardActions';
import { selectPrescriptionTotal } from '../selectors/payment';

const initialState = () => ({
  transaction: null,
  patient: null,
  paymentAmount: currency(0),
  insurancePolicy: null,
  paymentValid: true,
  paymentType: null,
});

export const PaymentReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;
      return { ...state, transaction };
    }

    case WIZARD_ACTIONS.NEXT_TAB: {
      const { transaction } = state;
      if (!transaction) return state;
      const paymentAmount = selectPrescriptionTotal({ payment: state });
      return { ...state, paymentAmount };
    }

    case PAYMENT_ACTIONS.SET_POLICY: {
      const { payload } = action;
      const { insurancePolicy } = payload;

      return { ...state, insurancePolicy };
    }

    case PAYMENT_ACTIONS.CHOOSE_PAYMENT_TYPE: {
      const { payload } = action;
      const { paymentType } = payload;

      return { ...state, paymentType };
    }

    case PAYMENT_ACTIONS.UPDATE_PAYMENT: {
      const { payload } = action;
      const { amount } = payload;

      return { ...state, paymentAmount: amount, creditOverflow: false, paymentValid: true };
    }

    case PAYMENT_ACTIONS.CREDIT_OVERFLOW: {
      return { ...state, creditOverflow: true, paymentValid: false };
    }

    default:
      return state;
  }
};
