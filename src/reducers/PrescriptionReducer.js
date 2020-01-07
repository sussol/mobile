/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { ROUTES } from '../navigation/constants';
import { UIDatabase } from '../database';

import { PRESCRIPTION_ACTIONS } from '../actions/PrescriptionActions';

const initialState = () => ({
  currentTab: 0,
  transaction: null,
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
      const { transaction } = state;
      const { id } = transaction;

      return {
        ...state,
        transaction: UIDatabase.get('Transaction', id),
      };
    }

    default:
      return state;
  }
};
