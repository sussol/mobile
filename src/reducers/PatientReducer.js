/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2019
 */

import { PATIENT_ACTIONS } from '../actions/PatientActions';

const patientInitialState = () => ({
  currentPatient: null,
  firstNameIsValid: true,
  lastNameIsValid: true,
  codeIsValid: true,
  dateOfBirthIsValid: true,
  phoneIsValid: true,
  countryIsValid: true,
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

      const fieldLookup = {
        address1: 'addressOneIsValid',
        address2: 'addressTwoIsValid',
        firstName: 'firstNameIsValid',
        lastName: 'lastNameIsValid',
        code: 'codeIsValid',
        dateOfBirth: 'dateOfBirthIsValid',
        phone: 'phoneIsValid',
        country: 'countryIsValid',
      };

      return { ...state, [fieldLookup[field]]: validity };
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
