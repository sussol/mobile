/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';

const patientInitialState = () => ({
  currentPatient: null,
  isEditing: false,
  isCreating: false,
  isValid: {
    code: true,
    dateOfBirth: true,
    country: true,
    addressOne: true,
    addressTwo: true,
  },
  firstName: '',
  lastName: '',
  code: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  addressOne: '',
  addressTwo: '',
  country: '',
});

export const PatientReducer = (state = patientInitialState(), action) => {
  const { type } = action;

  switch (type) {
    case PATIENT_ACTIONS.FIELD_VALIDITY: {
      const { payload } = action;
      const { field, validity } = payload;
      const { isValid } = state;

      const newValidityState = { ...isValid, [field]: validity };

      return { ...state, isValid: newValidityState };
    }

    case PATIENT_ACTIONS.FIELD_UPDATE: {
      const { payload } = action;
      const { field, value } = payload;

      return { ...state, [field]: value };
    }

    case PATIENT_ACTIONS.PATIENT_EDIT: {
      const { payload } = action;
      const { patient } = payload;

      const { firstName, lastName, emailAddress, code, phoneNumber } = patient;

      return {
        ...state,
        isEditing: true,
        currentPatient: patient,
        firstName,
        lastName,
        emailAddress,
        code,
        phoneNumber,
      };
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
