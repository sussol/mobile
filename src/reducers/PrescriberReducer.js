/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PRESCRIBER_ACTIONS } from '../actions/PrescriberActions';

const prescriberInitialState = () => ({
  currentPrescriber: null,
  isEditingPrescriber: false,
  isCreatingPrescriber: false,
});

export const PrescriberReducer = (state = prescriberInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case PRESCRIBER_ACTIONS.EDIT: {
      const { payload } = action;
      const { prescriber } = payload;
      return { ...state, isEditingPrescriber: true, currentPrescriber: prescriber };
    }

    case PRESCRIBER_ACTIONS.CREATE: {
      return { ...state, isCreatingPrescriber: true };
    }

    case PRESCRIBER_ACTIONS.COMPLETE: {
      return prescriberInitialState();
    }

    default: {
      return state;
    }
  }
};
