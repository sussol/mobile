/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';

const patientInitialState = () => ({
  currentPatient: null,
  isEditing: false,
  isCreating: false,
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

    default: {
      return state;
    }
  }
};
