/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { INSURANCE_ACTIONS } from '../actions/InsuranceActions';

const initialState = () => ({
  currentInsurancePolicy: null,
  isEditingInsurancePolicy: false,
  isCreatingInsurancePolicy: false,
  selectedInsurancePolicy: null,
});

export const InsuranceReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case INSURANCE_ACTIONS.CLOSE: {
      return {
        ...state,
        isEditingInsurancePolicy: false,
        isCreatingInsurancePolicy: false,
        currentInsurancePolicy: null,
      };
    }

    case INSURANCE_ACTIONS.EDIT: {
      const { payload } = action;
      const { insurancePolicy } = payload;

      return { ...state, isEditingInsurancePolicy: true, currentInsurancePolicy: insurancePolicy };
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

    case INSURANCE_ACTIONS.SET: {
      const { payload } = action;
      const { insurancePolicy } = payload;

      return { ...state, currentInsurancePolicy: insurancePolicy };
    }

    case INSURANCE_ACTIONS.CREATE: {
      return { ...state, isCreatingInsurancePolicy: true, currentInsurancePolicy: null };
    }

    case INSURANCE_ACTIONS.SELECT: {
      const { payload } = action;
      const { insurancePolicy } = payload;
      console.log('#################################');
      console.log(action);
      console.log('#################################');

      return { ...state, selectedInsurancePolicy: insurancePolicy };
    }

    default:
      return state;
  }
};
