/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';

const patientInitialState = () => ({
  currentPatient: null,
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

    default: {
      return state;
    }
  }
};
