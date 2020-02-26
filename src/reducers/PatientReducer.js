/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';
import { ROUTES } from '../navigation/index';

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
    case 'Navigation/NAVIGATE': {
      const { routeName, params } = action;

      if (routeName !== ROUTES.PRESCRIPTION) return state;
      const { transaction } = params;
      const { otherParty } = transaction;
      return { ...state, currentPatient: otherParty };
    }

    case PATIENT_ACTIONS.PATIENT_EDIT: {
      const { payload } = action;
      const { patient } = payload;
      return { ...state, isEditing: true, currentPatient: patient };
    }

    case PATIENT_ACTIONS.PATIENT_CREATION: {
      return { ...state, currentPatient: null, isCreating: true };
    }

    case PATIENT_ACTIONS.COMPLETE: {
      const { currentPatient } = state;
      return { ...patientInitialState(), currentPatient };
    }

    case PATIENT_ACTIONS.SORT_HISTORY: {
      const { payload } = action;
      const { sortKey } = payload;
      const { isAscending } = state;

      return { ...state, sortKey, isAscending: !isAscending };
    }

    case PATIENT_ACTIONS.VIEW_HISTORY: {
      const { payload } = action;
      const { patient } = payload;
      return { ...state, currentPatient: patient, viewingHistory: true };
    }

    case PATIENT_ACTIONS.CLOSE_HISTORY: {
      return { ...state, currentPatient: null, viewingHistory: false };
    }

    default: {
      return state;
    }
  }
};
