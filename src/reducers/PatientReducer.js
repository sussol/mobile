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
  creatingADR: false,
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
      const { payload } = action;
      const { patient } = payload;
      return { ...state, currentPatient: patient, isCreating: true };
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

    case PATIENT_ACTIONS.NEW_ADR: {
      const { payload } = action;
      const { patient } = payload;

      return { ...state, isADRModalOpen: true, currentPatient: patient, creatingADR: true };
    }

    case PATIENT_ACTIONS.SAVE_ADR:
    case PATIENT_ACTIONS.CANCEL_ADR: {
      return { ...state, currentPatient: null, creatingADR: false };
    }

    default: {
      return state;
    }
  }
};
