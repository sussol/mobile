/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';

import { PRESCRIPTION_ACTIONS } from '../actions/PrescriptionActions';

const initialState = () => ({
  currentTab: 0,
  transaction: null,
  itemSearchTerm: '',
});

export const PrescriptionReducer = (state = initialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;

      return { ...state, transaction };
    }
    case PRESCRIPTION_ACTIONS.REFRESH: {
      return { ...state };
    }

    case PRESCRIPTION_ACTIONS.FILTER: {
      const { payload } = action;
      const { itemSearchTerm } = payload;

      return { ...state, itemSearchTerm };
    }

    default:
      return state;
  }
};
