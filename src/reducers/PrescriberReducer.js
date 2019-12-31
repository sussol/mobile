/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PRESCRIBER_ACTIONS } from '../actions/PrescriberActions';
import { ROUTES } from '../navigation/index';

const prescriberInitialState = () => ({
  currentPrescriber: null,
  isEditingPrescriber: false,
  isCreatingPrescriber: false,
});

export const PrescriberReducer = (state = prescriberInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case 'Navigation/NAVIGATE': {
      const { routeName } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      return { ...state, currentPrescriber: null };
    }

    case PRESCRIBER_ACTIONS.EDIT: {
      const { payload } = action;
      const { prescriber } = payload;
      return { ...state, isEditingPrescriber: true, currentPrescriber: prescriber };
    }

    case PRESCRIBER_ACTIONS.CREATE: {
      return { ...state, currentPrescriber: null, isCreatingPrescriber: true };
    }

    case PRESCRIBER_ACTIONS.COMPLETE: {
      const { currentPrescriber } = state;
      return { ...prescriberInitialState(), currentPrescriber };
    }

    case PRESCRIBER_ACTIONS.SET: {
      const { payload } = action;
      const { prescriber } = payload;
      return { ...state, currentPrescriber: prescriber };
    }

    case PRESCRIBER_ACTIONS.FILTER: {
      const { payload } = action;
      const { searchTerm } = payload;
      return { ...state, searchTerm };
    }

    default: {
      return state;
    }
  }
};
