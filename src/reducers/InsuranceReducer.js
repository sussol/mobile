/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

import { INSURANCE_ACTIONS } from '../actions/InsuranceActions';

const initialState = () => ({
  currentPolicy: null,
  isEditing: false,
  isCreating: false,
});

export const InsuranceReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case INSURANCE_ACTIONS.CANCEL: {
      return state;
    }

    case INSURANCE_ACTIONS.EDIT: {
      return state;
    }

    case INSURANCE_ACTIONS.SAVE: {
      return state;
    }

    case INSURANCE_ACTIONS.SET: {
      return state;
    }

    case INSURANCE_ACTIONS.CREATE: {
      return state;
    }

    default:
      return state;
  }
};
