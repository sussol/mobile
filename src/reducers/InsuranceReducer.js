/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { INSURANCE_ACTIONS } from '../actions/InsuranceActions';
import { ROUTES } from '../navigation/index';

const initialState = () => ({
  currentInsurancePolicy: null,
  isEditingInsurancePolicy: false,
  isCreatingInsurancePolicy: false,
  selectedInsurancePolicy: null,
});

export const InsuranceReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName } = action;
      if (routeName !== ROUTES.PRESCRIPTION) return state;

      return initialState();
    }

    case INSURANCE_ACTIONS.CLOSE: {
      return {
        ...state,
        isEditingInsurancePolicy: false,
        isCreatingInsurancePolicy: false,
        currentInsurancePolicy: null,
      };
    }

    case INSURANCE_ACTIONS.EDIT: {
      const { selectedInsurancePolicy } = state;

      return {
        ...state,
        isEditingInsurancePolicy: true,
        currentInsurancePolicy: selectedInsurancePolicy,
      };
    }

    case INSURANCE_ACTIONS.SAVE: {
      const { payload } = action;
      const { insurancePolicy } = payload;

      return {
        ...state,
        currentInsurancePolicy: null,
        isCreatingInsurancePolicy: false,
        isEditingInsurancePolicy: false,
        selectedInsurancePolicy: insurancePolicy,
      };
    }

    case INSURANCE_ACTIONS.CREATE: {
      return { ...state, isCreatingInsurancePolicy: true, currentInsurancePolicy: null };
    }

    case INSURANCE_ACTIONS.SELECT: {
      const { payload } = action;
      const { insurancePolicy } = payload;

      return { ...state, selectedInsurancePolicy: insurancePolicy };
    }

    default:
      return state;
  }
};
