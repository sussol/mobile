/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';

const patientInitialState = () => ({
  currentPatient: null,
  isEditing: false,
  isCreating: false,
  viewingHistory: false,
  sortKey: 'itemName',
  isAscending: true,
});

export const PatientReducer = (state = patientInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case PATIENT_ACTIONS.PATIENT_EDIT: {
      const { payload } = action;
      const { patient } = payload;
      return { ...state, isEditing: true, currentPatient: patient };
    }

    case PATIENT_ACTIONS.PATIENT_CREATION: {
      return { ...state, isCreating: true };
    }

    case PATIENT_ACTIONS.COMPLETE: {
      return patientInitialState();
    }

    case PATIENT_ACTIONS.SORT_HISTORY: {
      const { payload } = action;
      const { sortKey } = payload;
      const { isAscending } = state;

      return { ...state, sortKey, isAscending: !isAscending };
    }

    case PATIENT_ACTIONS.VIEW_HISTORY: {
      return { ...state, viewingHistory: true };
    }

    case PATIENT_ACTIONS.CLOSE_HISTORY: {
      return { ...state, viewingHistory: false };
    }

    default: {
      return state;
    }
  }
};
