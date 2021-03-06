/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import currency from '../localization/currency';
import { ROUTES } from '../navigation';
import { PAYMENT_ACTIONS } from '../actions/PaymentActions';
import { WIZARD_ACTIONS } from '../actions/WizardActions';
import { selectPrescriptionTotal } from '../selectors/payment';
import { INSURANCE_ACTIONS } from '../actions/InsuranceActions';
import { PRESCRIPTION_ACTIONS } from '../actions/PrescriptionActions';

const initialState = () => ({
  transaction: null,
  patient: null,
  paymentAmount: currency(0),
  discountRate: 0,
  paymentValid: true,
  paymentType: null,
});

export const PaymentReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'NAVIGATE': {
      const { payload } = action;
      const { name, params } = payload;

      if (name !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;
      return { ...initialState(), transaction };
    }

    case PRESCRIPTION_ACTIONS.DELETE: {
      return { ...state, transaction: null };
    }

    case WIZARD_ACTIONS.NEXT_TAB: {
      const { transaction } = state;
      if (!transaction) return state;
      const paymentAmount = selectPrescriptionTotal({ payment: state });
      return { ...state, paymentAmount };
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

    case INSURANCE_ACTIONS.SAVE:
    case INSURANCE_ACTIONS.SELECT: {
      const { payload } = action;
      const { insurancePolicy } = payload;
      const { discountRate } = insurancePolicy;
      const paymentAmount = selectPrescriptionTotal({ payment: { ...state, discountRate } });

      return {
        ...state,
        discountRate,
        paymentAmount,
      };
    }

    default:
      return state;
  }
};
